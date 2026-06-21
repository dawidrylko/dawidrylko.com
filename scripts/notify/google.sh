#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# --- Configuration ---------------------------------------------------------
BASE_URL="https://dawidrylko.com"
STATIC_PAGES=("bio" "blog" "contact" "metadata" "setup" "files")
POSTS_DIR="../../../content/pl/"
TMP_DIR="$(pwd)/tmp"
TMP_FILE="$TMP_DIR/google.csv"

# Pinned easyindex-cli release (https://github.com/usk81/easyindex-cli).
# Bump EASYINDEX_VERSION and EASYINDEX_SHA256 together when upgrading.
EASYINDEX_VERSION="1.0.6"
EASYINDEX_SHA256="5b50e5294f6786ed2885b589ceb74f34cb9cad401f4be7b03c674cfb6ab542b7"
EASYINDEX_ARCHIVE="easyindex-cli_${EASYINDEX_VERSION}_linux_amd64.tar.gz"
EASYINDEX_URL="https://github.com/usk81/easyindex-cli/releases/download/v${EASYINDEX_VERSION}/${EASYINDEX_ARCHIVE}"
EASYINDEX_CLI="./easyindex-cli"

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
      echo "Command failed after ${attempt} attempt(s): $*" >&2
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
  if [ -z "${GOOGLE_JSON_KEY_FILE:-}" ]; then
    skip "GOOGLE_JSON_KEY_FILE is not set or is empty. Skipping Google notification."
  fi
}

# Create a temporary working directory
create_tmp_directory() {
  if [ ! -d "$TMP_DIR" ]; then
    echo "Creating temporary working directory: $TMP_DIR"
    mkdir "$TMP_DIR" || log_error "Failed to create directory $TMP_DIR"
  fi
}

# Download and verify the pinned easyindex-cli binary.
download_easyindex_cli() {
  if [ -x "$EASYINDEX_CLI" ]; then
    return 0
  fi

  echo "Fetching easyindex-cli v${EASYINDEX_VERSION}..."
  retry_with_backoff curl -fsSL --max-time 60 -o "$EASYINDEX_ARCHIVE" "$EASYINDEX_URL" \
    || log_error "Failed to download easyindex-cli binary."

  echo "Verifying checksum..."
  echo "${EASYINDEX_SHA256}  ${EASYINDEX_ARCHIVE}" | sha256sum -c - \
    || log_error "Checksum verification failed for ${EASYINDEX_ARCHIVE}."

  tar xzf "$EASYINDEX_ARCHIVE" || log_error "Failed to extract easyindex-cli binary."
  echo
}

# Write the Google service account credentials from the environment.
write_credentials_file() {
  echo "Using the GOOGLE_JSON_KEY_FILE environment variable..."
  echo "$GOOGLE_JSON_KEY_FILE" > "$TMP_DIR/credentials.json" \
    || log_error "Failed to write to credentials file $TMP_DIR/credentials.json"
}

# Construct submission payload
construct_submission_payload() {
  echo "\"notification_type\",\"url\"" >> "$TMP_FILE"
  echo "\"URL_UPDATED\",\"${BASE_URL}/\"" >> "$TMP_FILE"

  for page in "${STATIC_PAGES[@]}"; do
    echo "\"URL_UPDATED\",\"${BASE_URL}/${page}/\"" >> "$TMP_FILE"
  done

  if [ -d "$POSTS_DIR" ]; then
    POSTS=("$POSTS_DIR"*/)
    for ((i=0; i<${#POSTS[@]}; i++)); do
      POST_DIR="${POSTS[i]}"
      POST_NAME=$(basename "$POST_DIR")
      POST_SLUG="${POST_NAME:12}"
      echo "\"URL_UPDATED\",\"${BASE_URL}/${POST_SLUG}/\"" >> "$TMP_FILE"
    done
  fi

  echo "Constructed CSV file contents:"
  cat "$TMP_FILE"
  echo
}

# Submit URLs to Google search engine
submit_to_search_engine() {
  echo "Submitting to Google via Indexing API..."
  retry_with_backoff "$EASYINDEX_CLI" google publish --csv "$TMP_FILE" -C "$TMP_DIR/credentials.json" \
    || log_error "An error returned by easyindex-cli. Exiting."
  echo
}

# Main execution
check_required_secrets
create_tmp_directory

cd "$TMP_DIR" || log_error "Failed to change to temporary directory $TMP_DIR"

download_easyindex_cli
write_credentials_file
construct_submission_payload
submit_to_search_engine

end_time=$(date +%s.%3N)
duration=$(echo "scale=0; ($end_time - $start_time) * 1000 / 1" | bc)
echo "---------------------------------"
echo "Script completed in $duration milliseconds."
