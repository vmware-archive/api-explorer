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
                        url : $rootScope.settings.remoteApisEndpoint + '/dcr/rest/apix/apis'
                    }).then(function(response) {

                        angular.forEach(response.data, function(value, index) {
                            var source = "remote";

                            // Get type and products from tags
                            var type = "swagger";
                            var products = [];
                            var languages = [];
                            if (value.tags) {
                                if (angular.isArray(value.tags)) {
                                    type = filterFilter(value.tags, {category: "display"}, true)[0].name;
                                    angular.forEach(filterFilter(value.tags, {category: "product"}, true), function(value, index) {
                                        products.push(value.name.replace(";", " "));
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

                           // Populate filters
                           result.filters.products.pushUnique(products, true);
                           result.filters.languages.pushUnique(languages, true);
                           result.filters.types.pushUnique(type);
                           result.filters.sources.pushUnique(source);

                           result.apis.push({
                                id: parseInt(value.id, 10),
                                name: value.name,
                                version: value.version,
                                description: value.description,
                                url: value.api_ref_doc_url,
                                type: type,
                                products: products,
                                languages: languages,
                                source: source
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

                            // Clean the type
                            if (value.url && value.url.endsWith(".json")) {
                                value.type = "swagger";
                            } else if (value.url && value.url.endsWith(".raml")) {
                                value.type = "raml";
                            } else {
                                value.type = "html";
                            }

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
                    var result = null;

                    $http({
                        method : 'GET',
                        url : $rootScope.settings.remoteApisEndpoint + '/dcr/rest/apix/apis/' + apiId + '/resources'
                    }).then(function(response) {

                    	var sdks = [];
                        var docs = [];

                        var setArray = function(resourceType, arr, value) {
                        	if (value.resource_type == resourceType) {

                        		arr.push({
                                	title: value.name + ' ' + value.version,
                                    webUrl: value.web_url,
                                    downloadUrl: value.download_url,
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
                        	result = {resources:{}};
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
                    $http({
                        method : 'GET',
                        url : $rootScope.settings.remoteApisEndpoint + '/sampleExchange/v1/search/samples?platform=' + platform + '&summary=true'
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
                                webUrl: value.webUrl,
                                downloadUrl: value.downloadUrl,
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
                }
            };

        return definitions;
    }

    // Service used to fetch the APIs
    angular.module("apiExplorerApp").factory(serviceName, service);

})(angular);
