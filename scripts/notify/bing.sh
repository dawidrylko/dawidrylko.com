#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# --- Configuration ---------------------------------------------------------
BASE_URL="https://dawidrylko.com"
STATIC_PAGES=("bio" "blog" "contact" "metadata" "setup" "files")
POSTS_DIR="../../../content/pl/"
TMP_DIR="$(pwd)/tmp"
TMP_FILE="$TMP_DIR/bing.json"

BING_API_BASE_URL="https://ssl.bing.com/webmaster/api.svc/json"
BING_SUBMIT_ENDPOINT="SubmitUrlbatch"

# Retry tuning for network/API calls.
MAX_RETRIES=4
INITIAL_BACKOFF=2

start_time=$(date +%s.%3N)

log_error() {
  echo "Error: $1" >&2
  exit 1
}

# Graceful, non-fatal exit (e.g. missing optional secret). The deploy has
# already been published, so a skipped notification must not fail the job.
skip() {
  echo "Skip: $1"
  exit 0
}

# Run a command, retrying with exponential backoff on failure.
retry_with_backoff() {
  local attempt=1
  local delay=$INITIAL_BACKOFF
  while true; do
    if "$@"; then
      return 0
    fi
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
      echo "Command failed after ${attempt} attempt(s)." >&2
      return 1
    fi
    echo "Attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay}s..." >&2
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
}

# Validate required secrets up front; skip gracefully when absent.
check_required_secrets() {
  if [ -z "${BING_API_KEY:-}" ]; then
    skip "BING_API_KEY is not set or is empty. Skipping Bing notification."
  fi
}

# Create a temporary working directory
create_tmp_directory() {
  if [ ! -d "$TMP_DIR" ]; then
    echo "Creating temporary working directory: $TMP_DIR"
    mkdir "$TMP_DIR" || log_error "Failed to create directory $TMP_DIR"
  fi
}

# Construct submission payload
construct_submission_payload() {
  local json_content="{\"siteUrl\": \"$BASE_URL\", \"urlList\": [\"$BASE_URL/\","

  for page in "${STATIC_PAGES[@]}"; do
    json_content+="\"$BASE_URL/$page/\","
  done

  if [ -d "$POSTS_DIR" ]; then
    POSTS=("$POSTS_DIR"*/)
    for ((i=0; i<${#POSTS[@]}; i++)); do
      POST_DIR="${POSTS[i]}"
      POST_NAME=$(basename "$POST_DIR")
      POST_SLUG="${POST_NAME:12}"
      json_content+="\"$BASE_URL/$POST_SLUG/\","
    done
  fi

  json_content="${json_content%,}]}"

  echo "Constructed JSON Body:"
  echo "$json_content" | jq '.' > "$TMP_FILE" || log_error "Failed writing to $TMP_FILE"
  cat "$TMP_FILE"
  echo
}

# Submit URLs to Bing search engine (single attempt; wrapped by retry helper).
submit_attempt() {
  local bing_api_url="${BING_API_BASE_URL}/${BING_SUBMIT_ENDPOINT}?apikey=${BING_API_KEY}"
  local response http_code body

  response=$(curl -s -w "%{http_code}" --max-time 30 "$bing_api_url" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "@$TMP_FILE") || { echo "curl request to Bing API failed." >&2; return 1; }

  http_code=${response: -3}
  body=${response::-3}

  echo "HTTP Response Code: $http_code"
  echo "API Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"
  echo

  if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
    echo "Bing API returned non-success status: $http_code" >&2
    return 1
  fi

  return 0
}

submit_to_search_engine() {
  echo "Submitting to Bing via URL Submission API..."
  retry_with_backoff submit_attempt || log_error "Failed submitting to Bing API."
}

# Main execution
check_required_secrets
create_tmp_directory

cd "$TMP_DIR" || log_error "Failed to change to temporary directory $TMP_DIR"

construct_submission_payload
submit_to_search_engine

end_time=$(date +%s.%3N)
duration=$(echo "scale=0; ($end_time - $start_time) * 1000 / 1" | bc)
echo "---------------------------------"
echo "Script completed in $duration milliseconds."
