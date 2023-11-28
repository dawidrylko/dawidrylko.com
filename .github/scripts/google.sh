#!/usr/bin/env bash

# Configurable variables used in IndexNow call and URL construction
HOST="dawidrylko.com";
BASE_URL="https://${HOST}";
EASYINDEX_CLI_VERSION="1.0.6";

BLOG_DIR=../../../content/blog/; # Location of /content/blog/ folder relative to tmp working dir

WORKING_DIR=$( pwd; );
TMP_DIR=$WORKING_DIR"/tmp";

LOCAL_CREDENTIALS_FILE=../credentials.json;
CREDENTIALS_FILE=credentials.json;
URL_FILE=urls.csv;

# Look for a -o <value> flag to override the operating system
# selection from linux to macos
while getopts o: flag
do
  case "${flag}" in
    o) OPERATING_SYSTEM=${OPTARG};;
  esac
done

if [[ $OPERATING_SYSTEM == "macos" ]]
  then
    EASYINDEX_CLI_OS="darwin_amd64"; # Assumes a mac with an Intel CPU
  else
    # Use linux as a default OS
    OPERATING_SYSTEM="linux";
    EASYINDEX_CLI_OS="linux_amd64";
fi
echo "Using operating system: $OPERATING_SYSTEM";

# Create and enter the working directory if it does not exist
if [ ! -d $TMP_DIR ]
  then
    echo "Creating temporary working directory.";
    mkdir $TMP_DIR;
fi
cd $TMP_DIR;

# Look for an existing easyindex-cli binary
EASYINDEX_CLI=./easyindex-cli
if [ ! -f $EASYINDEX_CLI ]
  then
    # Construct the easyindex-cli download URL
    EASYINDEX_CLI_URL="https://github.com/usk81/easyindex-cli/releases/download/v${EASYINDEX_CLI_VERSION}/easyindex-cli_${EASYINDEX_CLI_VERSION}_${EASYINDEX_CLI_OS}.tar.gz";
    echo "Using easyindex_cli URL: $EASYINDEX_CLI_URL";

    echo "Fetching easyindex_cli binary.";
    curl -s -L $EASYINDEX_CLI_URL | tar xz;
fi

# Look for a local credentials file
if [ -f $LOCAL_CREDENTIALS_FILE ]
  then
    echo "Using local service account credentials.";
    cp $LOCAL_CREDENTIALS_FILE $CREDENTIALS_FILE;
  else
    echo "No local service account credentials file found...";
    echo "Using the GOOGLE_JSON_KEY_FILE environment variable...";

    if [ -z "${GOOGLE_JSON_KEY_FILE}" ]
      then
        echo "GOOGLE_JSON_KEY_FILE is not set or is empty. Exiting.";
        exit 1;
    fi

    touch $CREDENTIALS_FILE;
    echo $GOOGLE_JSON_KEY_FILE >> $CREDENTIALS_FILE;
fi

echo "Building URL list from repository structure.";
if [ -f $URL_FILE ]
  then
    # Clean up an existing URLs CSV file
    rm $URL_FILE;
fi

# Begin URLs CSV file creation
touch $URL_FILE;
echo ""notification_type","url"" >> $URL_FILE; # Headers line

echo ""URL_UPDATED","${BASE_URL}/"" >> $URL_FILE; # Add root URL

# Iterate over folders in the /content/blog/ directory
# to create links to each individual generated blog page
BLOGS=($(ls $BLOG_DIR));
for BLOG in "${BLOGS[@]}"
do
  echo ""URL_UPDATED","${BASE_URL}/blog/${BLOG}/"" >> $URL_FILE;
done
# URLs CSV file creation complete

echo "URLs CSV file contents:";
cat $URL_FILE;

echo;
echo "---";
echo "Updating Google through Indexing API...";
$EASYINDEX_CLI google -d -c $URL_FILE;
if [ $? -ne 0 ]
  then
    echo "Error returned by easyindex-cli. Exiting.";
    exit 1;
fi

echo;
echo "Done.";
