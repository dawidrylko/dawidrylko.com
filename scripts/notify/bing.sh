#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Submits to Bing only the URLs whose sources changed between the previous
# deploy (BEFORE_SHA, the push's `before`) and HEAD. A change to shared code
# (layouts, components, styles, config) submits nothing: the daily quota is
# small (about 100 URLs) and Bing picks template changes up from the sitemap.
# Kept compatible with bash 3.2, so the tests also run on stock macOS.

# --- Configuration ---------------------------------------------------------
BASE_URL="https://dawidrylko.com"
CONTENT_DIR="content/pl"
PAGES_DIR="src/pages"

BING_API_BASE_URL="https://ssl.bing.com/webmaster/api.svc/json"

# Retry tuning for transient failures (network, 429, 5xx).
MAX_RETRIES=4
INITIAL_BACKOFF="${BING_INITIAL_BACKOFF:-2}"

# Return codes of a single submission attempt.
ATTEMPT_RETRYABLE=1
ATTEMPT_QUOTA=2
ATTEMPT_FATAL=3

LAST_MESSAGE=""

log_error() {
  echo "::error title=Bing notification::$1"
  exit 1
}

# Graceful, non-fatal exit. The deploy has already been published, so a
# skipped notification must not fail the job.
skip() {
  echo "Skip: $1"
  exit 0
}

# Non-fatal, but surfaced as an annotation on the run summary.
warn_and_exit() {
  echo "::warning title=Bing notification::$1"
  exit 0
}

check_required_secrets() {
  if [ -z "${BING_API_KEY:-}" ]; then
    skip "BING_API_KEY is not set or is empty. Skipping Bing notification."
  fi
}

# The commit to diff against. A first push leaves `before` zeroed and a force
# push can point it outside the shallow clone, so fall back to the parent.
resolve_base() {
  local before="${BEFORE_SHA:-}"
  if [ -n "$before" ] && [ "$before" != "0000000000000000000000000000000000000000" ]; then
    if git cat-file -e "${before}^{commit}" 2>/dev/null ||
      { git fetch --quiet --no-tags --depth=1 origin "$before" 2>/dev/null &&
        git cat-file -e "${before}^{commit}" 2>/dev/null; }; then
      echo "$before"
      return 0
    fi
    echo "Previous deploy ${before} is unreachable, diffing against HEAD^." >&2
  fi
  git rev-parse --verify --quiet "HEAD^"
}

# True when the file's frontmatter sets `noIndex: true`.
has_noindex_frontmatter() {
  awk 'NR == 1 && $0 != "---" { exit }
       NR > 1 && $0 == "---" { exit }
       /^noIndex:[[:space:]]*true[[:space:]]*$/ { found = 1; exit }
       END { exit !found }' "$1"
}

# Mirrors generateId in src/content.config.ts: the id is the path without the
# extension and `/index`, stripped up to the last `--` (the date prefix).
content_url() {
  local slug="${1##*--}" page="$2"
  if [ "$page" = "index" ]; then
    echo "$BASE_URL/$slug/"
  else
    echo "$BASE_URL/$slug/$page/"
  fi
}

# Prints the public URL a changed (still existing) path renders to, or nothing
# when the path is shared code, tooling, a dynamic route or a noindex page.
path_to_url() {
  local path="$1" rest dir file page source candidate

  case "$path" in
    "$CONTENT_DIR"/*/*)
      rest="${path#"$CONTENT_DIR"/}"
      dir="${rest%%/*}"
      file="${rest#*/}"
      case "$file" in */*) return 0 ;; esac
      case "$file" in
        *.md | *.mdx)
          page="${file%.*}"
          source="$path"
          ;;
        *)
          # A post asset (a featured image) changes the post itself.
          page="index"
          source=""
          for candidate in "$CONTENT_DIR/$dir/index.mdx" "$CONTENT_DIR/$dir/index.md"; do
            if [ -f "$candidate" ]; then
              source="$candidate"
              break
            fi
          done
          [ -n "$source" ] || return 0
          ;;
      esac
      has_noindex_frontmatter "$source" && return 0
      content_url "$dir" "$page"
      ;;
    "$PAGES_DIR"/*.astro)
      page="${path#"$PAGES_DIR"/}"
      page="${page%.astro}"
      case "$page" in */* | *\[* | 404) return 0 ;; esac
      # Covers both noIndex and noIndexFollow.
      grep -q 'noIndex' "$path" && return 0
      if [ "$page" = "index" ]; then
        echo "$BASE_URL/"
      else
        echo "$BASE_URL/$page/"
      fi
      ;;
  esac
  return 0
}

collect_urls() {
  local path
  git diff --name-only --no-renames --diff-filter=d "$1" HEAD |
    while IFS= read -r path; do
      path_to_url "$path"
    done |
    sort -u
}

# The remaining daily quota, or nothing when Bing does not report it.
fetch_daily_quota() {
  local site response http_code body
  site=$(jq -rn --arg s "$BASE_URL" '$s | @uri')
  response=$(curl -s -w '\n%{http_code}' --max-time 30 \
    "${BING_API_BASE_URL}/GetUrlSubmissionQuota?siteUrl=${site}&apikey=${BING_API_KEY}") || return 0
  http_code="${response##*$'\n'}"
  body="${response%$'\n'*}"
  case "$http_code" in 2??) ;; *) return 0 ;; esac
  echo "$body" | jq -er '.d.DailyQuota | numbers' 2>/dev/null || true
}

submit_attempt() {
  local response http_code body
  response=$(curl -s -w '\n%{http_code}' --max-time 30 \
    "${BING_API_BASE_URL}/SubmitUrlbatch?apikey=${BING_API_KEY}" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "@$1") || { echo "curl request to Bing API failed." >&2; return $ATTEMPT_RETRYABLE; }

  http_code="${response##*$'\n'}"
  body="${response%$'\n'*}"

  echo "HTTP Response Code: $http_code"
  echo "API Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo

  case "$http_code" in
    2??) return 0 ;;
    429 | 5?? | 000) return $ATTEMPT_RETRYABLE ;;
  esac
  LAST_MESSAGE="HTTP $http_code: $body"
  if [ "$(echo "$body" | jq -r '.ErrorCode // empty' 2>/dev/null)" = "8" ]; then
    return $ATTEMPT_QUOTA
  fi
  return $ATTEMPT_FATAL
}

# Retries only transient failures. A spent quota or a rejected request fails
# the same way on every attempt, so it stops at once.
submit_with_retry() {
  local attempt=1 delay=$INITIAL_BACKOFF rc
  while true; do
    submit_attempt "$1" && rc=0 || rc=$?
    case "$rc" in
      0) return 0 ;;
      "$ATTEMPT_QUOTA") warn_and_exit "Bing daily quota exhausted, nothing submitted. ${LAST_MESSAGE}" ;;
      "$ATTEMPT_FATAL") log_error "Bing rejected the submission. ${LAST_MESSAGE}" ;;
    esac
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
      log_error "Failed submitting to Bing API after ${attempt} attempt(s)."
    fi
    echo "Attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay}s..." >&2
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
}

# --- Main --------------------------------------------------------------------
check_required_secrets
cd "$(git rev-parse --show-toplevel)" || log_error "Not inside a git checkout."

base=$(resolve_base) || skip "No previous commit to diff against."
echo "Changed since: $base"

URLS=()
while IFS= read -r url; do
  [ -n "$url" ] && URLS+=("$url")
done < <(collect_urls "$base")

if [ "${#URLS[@]}" -eq 0 ]; then
  skip "No public page changed since ${base}, nothing to submit."
fi

quota=$(fetch_daily_quota)
if [ -z "$quota" ]; then
  echo "Daily quota unknown, submitting all ${#URLS[@]} URL(s)."
elif [ "$quota" -le 0 ]; then
  warn_and_exit "Bing daily quota exhausted, ${#URLS[@]} URL(s) not submitted: ${URLS[*]}"
elif [ "${#URLS[@]}" -gt "$quota" ]; then
  echo "::warning title=Bing notification::Quota allows ${quota} of ${#URLS[@]} URL(s); not submitted: ${URLS[*]:$quota}"
  URLS=("${URLS[@]:0:$quota}")
fi

payload_file=$(mktemp)
trap 'rm -f "$payload_file"' EXIT
printf '%s\n' "${URLS[@]}" |
  jq -R . |
  jq -s --arg site "$BASE_URL" '{siteUrl: $site, urlList: .}' >"$payload_file" ||
  log_error "Failed building the submission payload."

echo "Submitting ${#URLS[@]} URL(s) to Bing via URL Submission API:"
cat "$payload_file"
submit_with_retry "$payload_file"
