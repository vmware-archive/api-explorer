#!/bin/bash

# This script is a post build step that fixes up the information in the ./dist/version.json
# to reflect the variables of this particular build

BRANCH_DIR="$( cd "$( dirname "$0" )" && pwd )"

VERSION_FILE=${BRANCH_DIR}/dist/version.json

NOW=`date +%FT%T%Z`
APIX_VERSION=`grep \"version\" ./package.json | sed 's/[\",]//g' | sed 's/[ \t]*version:[ \t]*//g'`
: "${BRANCH_NAME:=`git rev-parse --abbrev-ref HEAD`}"
: "${CHANGE_NUMBER:=`git rev-parse HEAD`}"
: "${BUILD_NUMBER:=0}"

#echo "BUILD_NUMBER=${BUILD_NUMBER}"
#echo "BRANCH_NAME=${BRANCH_NAME}"
#echo "CHANGE_NUMBER=${CHANGE_NUMBER}"
#echo "APIX_VERSION=${APIX_VERSION}"
#echo "NOW=${NOW}"

if [ -f ${VERSION_FILE} ]; then
    sed -i "s/APIX_GIT_SHA/${CHANGE_NUMBER}/g" ${VERSION_FILE}
    sed -i "s/APIX_GIT_BRANCH/${BRANCH_NAME}/g" ${VERSION_FILE}
    sed -i "s/APIX_VERSION/${APIX_VERSION}/g" ${VERSION_FILE}
    sed -i "s/APIX_BUILD_DATE/${NOW} build:${BUILD_NUMBER}/g" ${VERSION_FILE}
    sed -i "s/APIX_BUILD_NUMBER/${BUILD_NUMBER}/g" ${VERSION_FILE}
else
    echo "version file '${VERSION_FILE}' does not exist."
    exit 1
fi
