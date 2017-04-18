#!/bin/bash
# Copyright (c) 2016 VMware, Inc. All Rights Reserved.
# This software is released under MIT license.
# The full license information can be found in LICENSE in the root directory of this project.

# This script creates a "release" that is a package of the built files for a given
# version.  You must do a build first via "grunt build", and then you can run this script
# to create the release packages (zips of the content).  After that those binaries are
# staged on Github using the web interface

#get the directory of this script regardless of where it is invoked from
BRANCH_DIR="$( cd "$( dirname "$0" )"/.. && pwd )"

VERSION=`grep version ${BRANCH_DIR}/bower.json | sed 's/[\",]//g' | sed 's/[ \t]*version:[ \t]*//g'`

echo "Packaging release ${VERSION}"

OUTPUT_DIR=${BRANCH_DIR}/build/release

rm -rf ${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}

DIST_ZIP=${OUTPUT_DIR}/api-explorer-dist-${VERSION}.zip
TOOLS_ZIP=${OUTPUT_DIR}/api-explorer-tools-${VERSION}.zip

pushd ${BRANCH_DIR}/dist
echo "Zipping ${BRANCH_DIR}/dist to ${DIST_ZIP}"
zip -r ${DIST_ZIP} ./*
popd

pushd ${BRANCH_DIR}/tools
echo "Zipping ${BRANCH_DIR}/tools to ${TOOLS_ZIP}"
rm *.pyo *.pyc
mkdir apixlocal
unzip -o -d ./apixlocal ./apixlocal.zip 
zip -r ${TOOLS_ZIP} ./*.py ./apixlocal
rm -rf ./apixlocal
popd

cp -v ${BRANCH_DIR}/build/api-explorer-${VERSION}.war ${OUTPUT_DIR}

echo "Build artifacts written to ${OUTPUT_DIR}"
