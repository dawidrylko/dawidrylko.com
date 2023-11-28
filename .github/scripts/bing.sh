#!/usr/bin/env bash
set -o errexit
set -o nounset

BASE_URL="https://dawidrylko.com"
BLOG_DIR="../../../content/blog/"
TMP_DIR="$(pwd)/tmp"
JSON_FILE="bing-submission-api-body.json"

start_time=$(date +%s.%3N)

create_temp_directory() {
  if [ ! -d "$TMP_DIR" ]; then
    echo "Creating temporary working directory: $TMP_DIR"
    mkdir "$TMP_DIR"
  fi
}

construct_json_body() {
  local json_content="{\"siteUrl\": \"$BASE_URL\", \"urlList\": [\"$BASE_URL/\","
  
  if [ -d "$BLOG_DIR" ]; then
    BLOGS=("$BLOG_DIR"/*/)
    
    for ((i=0; i<${#BLOGS[@]}; i++)); do
      json_content+="\"$BASE_URL${BLOGS[i]:${#BLOG_DIR}}\","
    done
  fi

  if [ -z "$json_content" ]; then
    echo "Error: JSON content is empty."
    exit 1
  fi
  
  json_content="${json_content%,}]}"

  echo "Constructed JSON Body:"
  echo "$json_content" > "$JSON_FILE"
  cat "$JSON_FILE"
  echo
}

handle_api_key() {
  if [ -z "${BING_API_KEY:-}" ]; then
    echo "BING_API_KEY is not set or is empty. Exiting."
    exit 1
  fi
}

submit_to_bing() {
  local bing_api_url="https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}"

  echo "Submitting to Bing API..."
  response=$(curl -s -w "%{http_code}" "$bing_api_url" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "@$JSON_FILE")
    
  http_code=${response: -3}
  body=${response::-3}
  
  echo "HTTP Response Code: $http_code"
  echo "API Response Body: $body"
  echo
}

create_temp_directory

cd "$TMP_DIR" || exit 1

construct_json_body
handle_api_key
submit_to_bing

end_time=$(date +%s.%3N)
duration=$(echo "($end_time - $start_time) * 1000" | bc)
echo "---------------------------------"
echo "Process completed in $duration milliseconds."
