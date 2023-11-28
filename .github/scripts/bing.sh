#!/usr/bin/env bash
set -o errexit
set -o nounset

BASE_URL="https://dawidrylko.com"
BLOG_DIR="../../../content/blog/"
TMP_DIR="$(pwd)/tmp"
JSON_FILE="bing-submission-api-body.json"

construct_json_body() {
  local json_content="{\"siteUrl\": \"$BASE_URL\", \"urlList\": [\"$BASE_URL/\","
  
  if [ -d "$BLOG_DIR" ]; then
    BLOGS=("$BLOG_DIR"/*/)
    
    for ((i=0; i<${#BLOGS[@]}; i++)); do
      json_content+="\"$BASE_URL${BLOGS[i]:${#BLOG_DIR}}\","
    done
  fi
  
  json_content="${json_content%,}]}"

  echo "$json_content" > "$JSON_FILE"
}

handle_api_key() {
  if [ -z "${BING_API_KEY:-}" ]; then
    echo "BING_API_KEY is not set or is empty. Exiting."
    exit 1
  fi
}

submit_to_bing() {
  local bing_api_url="https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}"

  curl "$bing_api_url" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "@$JSON_FILE" \
    -s -i
}

if [ ! -d "$TMP_DIR" ]; then
  mkdir "$TMP_DIR"
fi
cd "$TMP_DIR" || exit 1

construct_json_body
handle_api_key
submit_to_bing
