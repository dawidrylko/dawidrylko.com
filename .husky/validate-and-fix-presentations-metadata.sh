#!/usr/bin/env bash

set -e
set -u
set -o pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

readonly REQUIRED_AUTHOR="Dawid Ryłko"
readonly PRESENTATIONS_DIR="static/files/presentations"
readonly METADATA_CSV="${PRESENTATIONS_DIR}/metadata.csv"
readonly SUPPORTED_EXTENSIONS=("pdf")
readonly TEMP_METADATA="/tmp/presentations_metadata_$$"
readonly TEMP_RESULTS="/tmp/presentations_results_$$"

trap 'rm -f "$TEMP_METADATA" "$TEMP_RESULTS"' EXIT

total_files=0
valid_files=0
fixed_files=0
missing_csv_entries=0

log_header() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""
}

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

check_dependencies() {
    if ! command -v exiftool &> /dev/null; then
        log_error "Required dependency 'exiftool' is not installed"
        echo "  Install: brew install exiftool"
        exit 2
    fi
}

verify_metadata_csv() {
    if [[ ! -f "$METADATA_CSV" ]]; then
        log_error "Metadata CSV not found: $METADATA_CSV"
        echo ""
        echo "Create metadata.csv with format:"
        echo '  filename,title'
        echo '  js_01_node_pl,"JavaScript | Node.js..."'
        exit 2
    fi

    local first_line
    first_line=$(head -n 1 "$METADATA_CSV")
    if [[ "$first_line" != "filename,title" ]]; then
        log_error "Invalid CSV format. Expected header: filename,title"
        exit 2
    fi
}

load_metadata_csv() {
    local line_number=0
    > "$TEMP_METADATA"

    while IFS=, read -r filename title || [[ -n "$filename" ]]; do
        line_number=$((line_number + 1))
        [[ $line_number -eq 1 ]] && continue
        [[ -z "$filename" ]] && continue

        title=$(echo "$title" | sed 's/^"//; s/"$//')
        echo "${filename}|${title}" >> "$TEMP_METADATA"
    done < "$METADATA_CSV"
}

get_title_for_filename() {
    grep "^${1}|" "$TEMP_METADATA" 2>/dev/null | cut -d'|' -f2- || echo ""
}

get_basename_without_ext() {
    local basename
    basename=$(basename "$1")
    for ext in "${SUPPORTED_EXTENSIONS[@]}"; do
        basename="${basename%.${ext}}"
    done
    echo "$basename"
}

validate_and_fix_file() {
    local filepath="$1"
    local filename
    local expected_title
    local actual_title
    local actual_author
    local status="OK"
    local action=""

    filename=$(get_basename_without_ext "$filepath")
    expected_title=$(get_title_for_filename "$filename")

    if [[ -z "$expected_title" ]]; then
        missing_csv_entries=$((missing_csv_entries + 1))
        echo "${filepath}§MISSING§§§No CSV entry§${expected_title}" >> "$TEMP_RESULTS"
        return 1
    fi

    actual_title=$(exiftool -Title -s3 "$filepath" 2>/dev/null || echo "")
    actual_author=$(exiftool -Author -s3 "$filepath" 2>/dev/null || echo "")

    local needs_fix=0

    if [[ -z "$actual_author" || "$actual_author" != "$REQUIRED_AUTHOR" ]]; then
        needs_fix=1
    fi

    if [[ -z "$actual_title" || "$actual_title" != "$expected_title" ]]; then
        needs_fix=1
    fi

    if [[ $needs_fix -eq 1 ]]; then
        if exiftool \
            -Title="$expected_title" \
            -Author="$REQUIRED_AUTHOR" \
            -overwrite_original \
            "$filepath" >/dev/null 2>&1; then
            status="FIXED"
            action="Updated metadata"
            fixed_files=$((fixed_files + 1))
        else
            status="ERROR"
            action="Fix failed"
        fi
    else
        status="OK"
        action="Valid"
        valid_files=$((valid_files + 1))
    fi

    echo "${filepath}§${status}§${actual_author}§${actual_title}§${action}§${expected_title}" >> "$TEMP_RESULTS"
    return 0
}

find_presentation_files() {
    if [[ ! -d "$PRESENTATIONS_DIR" ]]; then
        log_error "Directory not found: $PRESENTATIONS_DIR"
        exit 2
    fi

    for ext in "${SUPPORTED_EXTENSIONS[@]}"; do
        find "$PRESENTATIONS_DIR" -maxdepth 1 -type f -name "*.${ext}" 2>/dev/null || true
    done
}

truncate_text() {
    local text="$1"
    local max_len="$2"
    if [[ ${#text} -gt $max_len ]]; then
        echo "${text:0:$((max_len-3))}..."
    else
        echo "$text"
    fi
}

display_results_table() {
    log_header "VALIDATION & FIX RESULTS"
    printf "${BOLD}%-3s %-25s %-11s %-70s${NC}\n" "#" "FILE" "AUTHOR" "TITLE"
    printf "%-3s %-25s %-11s %-70s\n" \
        "$(printf '%.0s─' {1..3})" \
        "$(printf '%.0s─' {1..25})" \
        "$(printf '%.0s─' {1..11})" \
        "$(printf '%.0s─' {1..70})"

    local row_num=0
    if [[ -f "$TEMP_RESULTS" ]]; then
        while IFS='§' read -r filepath status actual_author actual_title action expected_title; do
            row_num=$((row_num + 1))
            local filename
            filename=$(basename "$filepath")

            [[ -z "$actual_author" ]] && actual_author="(none)"
            [[ -z "$actual_title" ]] && actual_title="(none)"

            local display_file=$(truncate_text "$filename" 25)
            local display_author=$(truncate_text "$actual_author" 11)
            local display_title=$(truncate_text "$actual_title" 70)

            local color=""
            case "$status" in
                "OK")
                    color="${GREEN}"
                    ;;
                "FIXED")
                    color="${YELLOW}"
                    ;;
                "MISSING"|"ERROR")
                    color="${RED}"
                    ;;
            esac

            printf "${color}%-3d %-25s %-11s %-70s${NC}\n" \
                "$row_num" "$display_file" "$display_author" "$display_title"
        done < "$TEMP_RESULTS"
    fi

    echo ""
}

display_summary() {
    log_header "SUMMARY"

    printf "${BOLD}%-24s${NC} %d\n" "Total files processed:" "$total_files"
    printf "${GREEN}%-24s${NC} %d\n" "Already valid:" "$valid_files"
    printf "${YELLOW}%-24s${NC} %d\n" "Auto-fixed:" "$fixed_files"
    printf "${RED}%-24s${NC} %d\n" "Missing in CSV:" "$missing_csv_entries"
    echo ""

    if [[ $missing_csv_entries -gt 0 ]]; then
        log_error "COMMIT BLOCKED: Files missing from metadata.csv"
        echo ""
        echo "Add these files to ${METADATA_CSV}:"
        echo ""

        if [[ -f "$TEMP_RESULTS" ]]; then
            while IFS='§' read -r filepath status actual_author actual_title action expected_title; do
                if [[ "$status" == "MISSING" ]]; then
                    local filename
                    filename=$(get_basename_without_ext "$filepath")
                    echo "  ${filename},\"Your Title Here\""
                fi
            done < "$TEMP_RESULTS"
        fi

        echo ""
        return 1
    fi

    if [[ $fixed_files -gt 0 ]]; then
        log_success "Auto-fixed $fixed_files file(s)"
        log_info "Fixed files have been updated. Please review and stage them."
    fi

    log_success "All presentation files validated successfully!"
    return 0
}

main() {
    log_header "PRESENTATIONS METADATA VALIDATOR & AUTO-FIX"

    log_info "Source of Truth: ${METADATA_CSV}"
    log_info "Target Directory: ${PRESENTATIONS_DIR}"
    echo ""

    check_dependencies
    verify_metadata_csv
    load_metadata_csv

    log_info "Scanning presentation files..."

    > "$TEMP_RESULTS"

    local file_list
    file_list=$(find_presentation_files)

    if [[ -z "$file_list" ]]; then
        log_warning "No presentation files found"
        exit 0
    fi

    total_files=$(echo "$file_list" | wc -l | tr -d ' ')
    log_info "Found ${total_files} file(s)"
    echo ""

    echo "$file_list" | while read -r file; do
        [[ -z "$file" ]] && continue
        validate_and_fix_file "$file"
    done

    valid_files=$(grep -c '§OK§' "$TEMP_RESULTS" 2>/dev/null || echo "0")
    fixed_files=$(grep -c '§FIXED§' "$TEMP_RESULTS" 2>/dev/null || echo "0")
    missing_csv_entries=$(grep -c '§MISSING§' "$TEMP_RESULTS" 2>/dev/null || echo "0")

    valid_files=$(printf "%d" "$valid_files" 2>/dev/null || echo "0")
    fixed_files=$(printf "%d" "$fixed_files" 2>/dev/null || echo "0")
    missing_csv_entries=$(printf "%d" "$missing_csv_entries" 2>/dev/null || echo "0")

    display_results_table

    if display_summary; then
        exit 0
    else
        exit 1
    fi
}

main "$@"
