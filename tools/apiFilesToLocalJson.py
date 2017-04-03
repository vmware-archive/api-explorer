#!/usr/bin/python
"""
Copyright (c) 2016,  VMware Inc., All Rights Reserved.

This file is open source software released under the terms of the
BSD 3-Clause license, https://opensource.org/licenses/BSD-3-Clause:

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
 may be used to endorse or promote products derived from this software without
 specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Author:  Aaron Spear, VMware Inc.  http://github.com/aspear

###############################################################################
"""
import argparse
import sys
import os
import glob
import shutil
import json
import traceback

# relative import of markdown2 tool copied from https://github.com/trentm/python-markdown2
# to avoid requirement of pip installing the tool in order to use
import markdown2


# TODO figure out a better way to help with the column display in a terminal.
os.environ['COLUMNS'] = '100'

#str(shutil.get_terminal_size().columns)

version="0.1"

def stdout(lineString):
    sys.stdout.write(lineString)
    sys.stdout.write("\n")


def stderr(lineString):
    sys.stderr.write(lineString)
    sys.stderr.write("\n")

class Object(object):
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)

def addProductsFromFilename( api, inputFileName ):
    # some code to attempt to figure out which product(s) a product corresponds to
    # based on strings in the file name.  very primitive, needs to be improved.
    if 'nsx' in inputFileName:
        api.products.append("NSX")
    elif 'vrops' in inputFileName:
        api.products.append("vRealize Operations")
    elif 'vro' in inputFileName:
        api.products.append("vRealize Orchestrator")
    elif 'vra' in inputFileName:
        api.products.append("vRealize Automation")
    elif 'vrli' in inputFileName:
        api.products.append("vRealize Log Insight")
    elif 'vsphere' in inputFileName:
        api.products.append("vSphere")
    elif 'photon' in inputFileName:
        api.products.append("Photon Controller")


def addLocalOverviewResource(api, title, local_url):
    """
    Resources is a map of lists of objects.  For SDKs and 
    docs those are lists of Resource objects.  We are going to add 
    a single "overview" resource that is one object.
    """ 
    overview_resource = Object()
    overview_resource.title = title
    overview_resource.webUrl = local_url
    #downloadUrl: value.download_url,
    #categories: value.categories,
    #tags: value.tags
    api.resources['overview'] = overview_resource

def stageLocalSwagger2(swaggerJsonFilesToStage, outputJson, outputDir, outputFile, abbreviateDescription, htmlRootDir, generateOverviewHtml ):

    markdownConvertor = markdown2.Markdown()

    if not htmlRootDir and outputFile:
        htmlRootDir = os.path.dirname(outputFile)

    templateOverviewHtml = None
    templateOverviewHtmlFilePath = os.path.join(htmlRootDir,"overview-template.html")
    if os.path.isfile(templateOverviewHtmlFilePath):
        stdout("Reading overview template file %s" % templateOverviewHtmlFilePath)
        with open(templateOverviewHtmlFilePath,"r") as templateOverviewHtmlFile:
            templateOverviewHtml =  templateOverviewHtmlFile.read()
            #fixup relative path to style sheet to be absolute
            templateOverviewHtml = templateOverviewHtml.replace("href=\"styles/","href=\"/styles/")
    if not templateOverviewHtml:
        stdout("No overview template found.")
 
    for swaggerJsonFile in swaggerJsonFilesToStage:
        try:
            # read in json from the file
            with open(swaggerJsonFile) as swagger_file:
                json_data = json.load(swagger_file)

                # check if this is swagger 1.2
                # {
                #     "apiVersion":"v1",
                #     "swaggerVersion":"1.2",
                #     "basePath":"",
                #     "apis":[
                #        {"path":"apis/auth"},
                #        {"path":"apis/available"},
                #        {"path":"apis/availabilityzones"}
                # ...
                #     ]
                #}

                #{
                #  "swagger": "2.0",
                #  "info": {
                #    "version": "1.2",
                #    "title": "VMware vRealize Operations 6.2",
                title = json_data['info']['title']
                version = ""
                try:
                    version = json_data['info']['version']
                    version = version.replace("-SNAPSHOT","")  # drop any -SNAPSHOT from version number
                except Exception, e:
                    stdout("    warning: swagger json '%s' has no version" % ( swaggerJsonFile))
                full_description = ""
                description = ""
                abbrev_md_description = ""
                try:
                    description = json_data['info']['description']
                    full_description = description
                    abbrev_md_description = description
                    
                    if (abbreviateDescription):
                        # abbreviate the description so that it is only the first line, and 
                        # remove any markdown formatting
                        lfIndex = description.index('\n')
                        if lfIndex != -1:
                            description = description[:lfIndex]
                            description = description.strip()
                            abbrev_md_description = description
                            description = description.replace("#","")

                except Exception, e:
                    stdout("    warning: swagger json '%s' has no description" % ( swaggerJsonFile))

                #{
                #    "apis": [ {
                #        "name" : "NSX for vSphere API",
                #        "version" : "6.2",
                #        "url" : "db/swagger/api-nsx-6.2.json",
                #        "products": ["NSX"]
                #    }, {
                api = Object()   # a dict based python object that has a method to easily serialize to json
                api.name = title
                api.description = description                
                api.version = version
                api.resources = {}
                api.products = []

                stdout("Including '%s' version='%s' 'title='%s'" % ( swaggerJsonFile, version, title))

                relativePathToSwaggerJsonFile = os.path.basename(swaggerJsonFile)  # default path

                if outputDir:
                    # need to stage the file to the given directory and then figure out the relative path
                    newSwaggerJsonPath = os.path.join(outputDir,os.path.basename(swaggerJsonFile))

                    if (generateOverviewHtml):
                        stdout("    Abbreviating description")

                        json_data['info']['description'] = abbrev_md_description

                        stdout("    Rewriting '%s' to '%s'" % ( swaggerJsonFile, newSwaggerJsonPath))
                        with open(newSwaggerJsonPath,"w") as outputSwaggerJson:
                            json.dump(json_data,outputSwaggerJson,sort_keys=False, indent=4)

                        overviewBasePath, ext = os.path.splitext(newSwaggerJsonPath)
                        overviewHtmlPath = os.path.join(outputDir, overviewBasePath + ".html")
                        stdout("    Converting and writing overview html '%s'" % ( overviewHtmlPath))
                        with open(overviewHtmlPath,"w") as outputOverviewHtmlFile:
                            overviewHtml = markdownConvertor.convert(full_description)
                            if templateOverviewHtml:
                                # insert the converted markdown and write that so we get the style
                                overviewHtml = templateOverviewHtml.replace("OVERVIEW-BODY-PLACEHOLDER",overviewHtml)
                            outputOverviewHtmlFile.write(overviewHtml)


                        relativePathToOverviewHtmlFile = "/" + os.path.relpath(overviewHtmlPath,htmlRootDir)
                        stdout("    Adding overview resource '%s'" % ( relativePathToOverviewHtmlFile))
                        addLocalOverviewResource(api,"Overview",relativePathToOverviewHtmlFile)

                        # TODO translate to html
                        # TODO add resource for the overview

                    else:
                        stdout("Copying '%s' to '%s'" % ( swaggerJsonFile, newSwaggerJsonPath))
                        shutil.copyfile(swaggerJsonFile, newSwaggerJsonPath)

                    if outputFile:
                        relativePathToSwaggerJsonFile = os.path.relpath(newSwaggerJsonPath,os.path.dirname(outputFile))
                elif outputFile:
                    # refer to the file in place.  figure out relative path from the local.json file to
                    # the api ref file to use as the URL to the file in the API.
                    relativePathToSwaggerJsonFile = os.path.relpath(swaggerJsonFile,os.path.dirname(outputFile))

                stdout("    as relative path '" + relativePathToSwaggerJsonFile + "'")
                api.url = relativePathToSwaggerJsonFile

                # append the products to it based on stuff in the file name
                addProductsFromFilename( api, swaggerJsonFile )

                outputJson.apis.append(api)

        except Exception, e:
            sys.stderr.write("    exception parsing '%s'" % ( swaggerJsonFile))
            sys.stderr.write(traceback.format_exc())
            continue


def main(argv):

    # parser shared by all commands
    parser = argparse.ArgumentParser(description="VMware API explorer metadata staging tool.",
                                      usage="apiFilesToLocalJson.py --swagger <input directory or file(s)> --outdir <output directory for json files> --outfile <path to output api.json file>")
    parser.add_argument('--swaggerglob', nargs='+', help='One or more glob paths to match swagger json files stage.  e.g. path/to/*.json', required=False)
    parser.add_argument('--swaggerurl', nargs='+', help='One or more swagger urls. argument should be name=<value,description=<value>,version=<value>,url=<value>,product=<value>', required=False)
    parser.add_argument('--outdir', help='Optional path to output directory to copy all swagger json files to.  Copy only done if provided.')
    parser.add_argument('--outfile', help='Optional path to output json file for api list')
    parser.add_argument('--abbreviateDescription', help='If provided, abbreviate the description to only be the first line.', action='store_true')
    parser.add_argument('--generateOverviewHtml', help='If provided, generate overview HTML in the output directory', action='store_true')
    parser.add_argument('--htmlRootDir', help='Root directory for generated relative links.')

    if len(argv) == 0:
        parser.print_help()
        exit(1)

    args = parser.parse_args(args=argv)

    outputDir = None
    if args.outdir:
        outputDir = os.path.abspath(args.outdir)
        if not os.path.isdir(outputDir):
            os.makedirs(outputDir)

    outputJson = Object()
    outputJson.apis = []

    swaggerJsonFilesToStage = []
    if args.swaggerglob:
        for swaggerglob in args.swaggerglob:
            globMatches = glob.glob(swaggerglob)
            for g in globMatches:
                swaggerJsonFilesToStage.append(g)

    # stage any urls manually specified
    if args.swaggerurl:
        for swaggerurl in args.swaggerurl:
            metadataArray = swaggerurl.split(',')
            api = Object()
            api.name = False
            api.url = False
            api.products = []
            api.resources = []  # TODO support for resources.
            api.version = ''
            api.type = 'swagger'
            for metadata in metadataArray:
                nameValue=metadata.split("=")
                if 'nam' in nameValue[0]:
                    api.name = nameValue[1].strip()
                elif 'des' in nameValue[0]:
                    api.description = nameValue[1].strip()
                elif 'ver' in nameValue[0]:
                    api.version = nameValue[1].strip()
                elif 'url' in nameValue[0]:
                    api.url = nameValue[1].strip()
                elif 'pro' in nameValue[0]:
                    api.products.append(nameValue[1].strip())
            if api.name and api.url:
                outputJson.apis.append(api)
            else:
                sys.stderr.write('ERROR: incorrect format format for swaggerurl.  Must at least have name and url\n')
                parser.print_help()
                exit(1)

    # stage swagger2 files
    stageLocalSwagger2(swaggerJsonFilesToStage, outputJson, outputDir, args.outfile, args.abbreviateDescription, args.htmlRootDir, args.generateOverviewHtml )

    if args.outfile:
        stdout("Writing local index file " + args.outfile)
        with open(args.outfile,"w") as output_json_file:
            output_json_file.write(outputJson.toJSON())

if __name__ == "__main__":
    main(sys.argv[1:])
