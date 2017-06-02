/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
(function(angular) {

    "use strict";

    var serviceName = "apis";

    service.$inject = [ "$http", "$q", "$rootScope", "$cacheFactory", "filterFilter" ];

    function service($http, $q, $rootScope, $cacheFactory, filterFilter) {

        var cache = $cacheFactory(serviceName);

        var emptyResult = {
            apis : [],
            filters : {
                products : [],
                languages : [],
                types : [],
                sources : []
            }
        };

        // aaron note: I don't know if this is the best way to declare utility code.  perhaps this should be in a
        // separate file and not in this service file?
        var utils = {
            createDisplayStringForProducts : function(products) {
                var productDisplayString = "";
                // create a display string to be used in the list view
                if (products && products.length > 0) {
                    productDisplayString = products.join(",").replace(new RegExp(";", 'g')," ");
                }
                return productDisplayString;
            },
            createProductListNoVersions : function(products) {
                var productListNoVersions = [];
                angular.forEach(products, function (product, index) {
                    var productPair = product.split(";");
                    productListNoVersions.push(productPair[0]);
                });
                return productListNoVersions;
            },
            // this utility function is to work around an issue with insecure certificates on vdc-download.vmware.com.
            // As it turns on we figured out that in fact the certificate is OK, but this is a bug in many webkit browsers
            // including Chrome.  For Chrome browsers version 57 or later is needed (63 has the issue).  It seems that it
            // is also an issue for Safari.
            fixVMwareDownloadUrl : function(url) {
               return url;
               // if (url) {
               //     return url.replace("vdc-download", "vdc-repo");
               // } else {
               //     return url;
               // }
            }
        };

        var definitions = {

                getAllApis : function(){
                    var cacheKey = "allApis";
                    var deferred = $q.defer();

                    var result = cache.get(cacheKey);

                    if (result) {
                        deferred.resolve(result);
                    } else {
                        var result = angular.merge({}, emptyResult);

                        // Combine all API sources into a single result
                        $q.all([definitions.getRemoteApis(), definitions.getLocalApis()]).then(function(responses){
                            angular.forEach(responses, function(response, index) {
                                result.filters.products.pushUnique(response.filters.products, true);
                                result.filters.languages.pushUnique(response.filters.languages, true);
                                result.filters.types.pushUnique(response.filters.types, true);
                                result.filters.sources.pushUnique(response.filters.sources, true);
                                result.apis = result.apis.concat(response.apis);
                            });
                        }).finally(function() {
                            cache.put(cacheKey, result);
                            deferred.resolve(result);
                        });
                    }

                    return deferred.promise;
                },
                getRemoteApis : function(){
                    var deferred = $q.defer();
                    var result = angular.merge({}, emptyResult);

                    $http({
                        method : 'GET',
                        url : $rootScope.settings.remoteApisEndpoint + '/apis'
                    }).then(function(response) {
                        angular.forEach(response.data, function(value, index) {
                        	var source = "remote";

                            // Get type and products from tags
                            var type = "swagger";
                            var products = [];
                            var languages = [];
                            var apiGroup = "";
                            var add = false;

                            if (value.tags && value.tags.length > 0) {
                                if (angular.isArray(value.tags)) {
                                    type = filterFilter(value.tags, {category: "display"}, true)[0].name;
                                    var apiGroupTags = filterFilter(value.tags, {category: "api-group"}, true);

                                    if (apiGroupTags && apiGroupTags.length > 0) {
                                        apiGroup = apiGroupTags[0].name;
                                    }
                                    angular.forEach(filterFilter(value.tags, {category: "product"}, true), function(value, index) {
                                    	products.push(value.name);
                                    });

                                    angular.forEach(filterFilter(value.tags, {category: "programming-language"}, true), function(value, index) {
                                    	languages.push(value.name);
                                    });
                                }
                            }

                            // Clean the type
                            if (type == "iframe-documentation" || (value.api_ref_doc_url && value.api_ref_doc_url.endsWith(".html"))) {
                           		type = "html";
                            }

                            // for the resulting API, set the product list such that version numbers are removed.  this only
                            // effects filtering

                            result.apis.push({
                            	id: parseInt(value.id, 10),
                                name: value.name,
                        	    version: value.version,
                        	    api_uid: value.api_uid,
                        	    description: value.description,
                        	    url: utils.fixVMwareDownloadUrl(value.api_ref_doc_url),
                        	    type: type,
                        	    products: utils.createProductListNoVersions(products),
                                productDisplayString: utils.createDisplayStringForProducts(products),
                                languages: languages,
                            	source: source,
                                apiGroup: apiGroup
                            });

                        });

                    }).finally(function() {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getLocalApis : function(){
                    var deferred = $q.defer();

                    var result = angular.merge({}, emptyResult);

                    $http({
                        method : 'GET',
                        url : $rootScope.settings.localApisEndpoint
                    }).then(function(response) {

                        angular.forEach(response.data.apis, function(value, index) {
                            value.id = 10000 + index;
                            value.source = "local";

                            // if the local api did not provide an explict type, then
                            // try to figure it out from the url spec file
                            if (!value.type || 0 === value.type.length) {
	                            if (value.url && value.url.endsWith(".json")) {
	                                value.type = "swagger";
	                            } else if (value.url && value.url.endsWith(".raml")) {
	                                value.type = "raml";
	                            } else {
	                                value.type = "html";
	                            }
                            }

                            // create a display string to be used in the list view
                            value.productDisplayString = utils.createDisplayStringForProducts(value.products);

                            // remove version numbers from the products on the api for filter purposes
                            value.products = utils.createProductListNoVersions(value.products);

                            result.filters.products.pushUnique(value.products, true);
                            result.filters.languages.pushUnique(value.languages, true);
                            result.filters.types.pushUnique(value.type);
                            result.filters.sources.pushUnique(value.source);

                            result.apis.push(value);
                        });

                    }).finally(function() {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getRemoteApiResources : function(apiId){
                	var deferred = $q.defer();
                    var result = {resources:{}};

                    $http({
                        method : 'GET',
                        url : $rootScope.settings.remoteApisEndpoint + '/apis/' + apiId + '/resources'
                    }).then(function(response) {

                    	var sdks = [];
                        var docs = [];

                        var setArray = function(resourceType, arr, value) {
                        	if (value.resource_type == resourceType) {

                        	    // make the title of the item included a version if there was one provided
                                // and the name doesn't already end with the version string
                                var title = value.name;
                        	    if (value.version && !title.endsWith(value.version)) {
                        	        title = title + " " + value.version;
                                }

                        		arr.push({
                                	title: title,
                                    version: value.version,
                                    webUrl: utils.fixVMwareDownloadUrl(value.web_url),
                                    downloadUrl: utils.fixVMwareDownloadUrl(value.download_url),
                                    categories: value.categories,
                                    tags: value.tags
                                });
                            }
                        }

                        angular.forEach(response.data, function(value, index) {
                            setArray("SDK", sdks, value);
                            setArray("DOC", docs, value);
                        });

                        if (sdks.length || docs.length) {
                            console.log("got " + sdks.length + " sdks, " + docs.length + " docs");
                            if (sdks.length) {
                             	result.resources.sdks = sdks;
                            }
                        	if (docs.length) {
                        		result.resources.docs = docs;
                        	}
                        }
                    }).finally(function() {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                getSamples : function(platform){
                	var deferred = $q.defer();
                    var result = null;
                    if (!platform) {
                    	return;
                    }
                    var url = $rootScope.settings.remoteSampleExchangeApiEndPoint + '/search/samples?';
                    angular.forEach(platform.split(","), function(value, index) {
                    	if (index == 0) {
                    		url = url + 'platform=' + value;
                    	} else {
                    		url = url + '&platform=' + value;
                    	}

                    });

                    $http({
                        method : 'GET',
                        url : url + '&summary=true'
                    }).then(function(response) {
                    	var samples = [];

                        angular.forEach(response.data, function(value, index) {
                        	var tags = [];
                        	if (value.tags) {
                                if (angular.isArray(value.tags)) {

                                    angular.forEach(value.tags, function(tag, index) {
                                        tags.push(tag.name);
                                    });
                                }
                            }
                        	//console.log(tags);
                        	samples.push({
                            	title: value.name,
                            	platform: platform,
                                webUrl: utils.fixVMwareDownloadUrl(value.webUrl),
                                downloadUrl: utils.fixVMwareDownloadUrl(value.downloadUrl),
                                contributor: value.author.communitiesUser,
                                createdDate: value.created,
                                lastUpdated: value.lastUpdated,
                                tags: tags,
                                snippet: value.readmeHtml,
                                favoriteCount: value.favoriteCount
                                //commentCount: 3
                            });
                        });

                        if (samples.length) {
                        	result = {data:{}};
                        	result.data = samples;
                        }
                    },function(response) {
                    	var temp = response.data;
                    	console.log(temp);
                    }).finally(function() {
                        deferred.resolve(result);
                    });

                    return deferred.promise;
                },
                /* as the name implies this method calls web service to get a list of available API instances
                * versions from the web service and returns the id of the latest one in the result.data.
                * @return a promise for an object with data = id of the API
                */
                getLatestRemoteApiIdForApiUid : function(api_uid) {
                    var deferred = $q.defer();
                    var result = {data:null};

                    $http({
                        method : 'GET',
                        url : $rootScope.settings.remoteApisEndpoint + '/apis/uids/' + api_uid
                    }).then(function(response) {

                        //console.log("got response " + response)

                        // TODO sort through these Api instances and get the latest versions
                        // API id
                        if (response.data && response.data.length > 0) {
                            // TODO delete this debug code eventually
                            angular.forEach(response.data, function(value, index) {
                                console.log("api_uid=" + api_uid + " id=" + value.id + " version=" + value.version);
                            });
                            // get the last one
                            result.data = response.data[response.data.length-1].id;

                        } else {
                            console.log("api_uid=" + api_uid + " has no API instances.");
                        }
                    }).finally(function() {
                        deferred.resolve(result);
                    });
                    return deferred.promise;
                },
                /**
                 * Get the local overview-template.html file as a string and return it as a promise.
                 * String will be present in return objects .data member when resolved.
                 */
                getLocalOverviewTemplate : function(){
                    var deferred = $q.defer();
                    var result = {data:null};
                    //console.log("loading overview template");

                    $http({
                        method : 'GET',
                        url : '/overview-template.html'
                    }).then(function(response) {
                        //console.log("got overview template");
                        result.data = response.data;
                    }).finally(function() {
                        deferred.resolve(result);
                    });
                    return deferred.promise;
                },
                /**
                 * Get the remote overview html as a string and return it as a promise.
                 * String will be present in return objects .data member when resolved.
                 */
                getOverviewBody : function(url){
                    var deferred = $q.defer();
                    var result = {data:null};
                    //console.log("loading overview body");

                    $http({
                        method : 'GET',
                        url : url
                    }).then(function(response) {
                        //console.log("got overview body");
                        result.data = response.data;
                    }).finally(function() {
                        deferred.resolve(result);
                    });
                    return deferred.promise;
                }
            };

        return definitions;
    }

    // Service used to fetch the APIs
    angular.module("apiExplorerApp").factory(serviceName, service);

})(angular);