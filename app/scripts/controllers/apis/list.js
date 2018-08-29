/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

angular.module('apiExplorerApp').controller('ApisListCtrl', function($rootScope, $scope, $http, $window, $timeout, $route, $routeParams, $q, $sce, $cacheFactory, filterFilter, apis) {

    /**
     * Public Variables
     */
    $scope.loading = 0; // Loading when > 0
    $scope.overviewHtml = "";
    $scope.apis = [];
    $scope.filteredApis = [];
    $scope.products = [];
    $scope.languages = [];
    $scope.types = [];
    $scope.sources = [];
    $scope.filters = {
        keywords : "",
        products : [],
        languages: [],
        types: [],
        sources: []
    };
    $scope.apiListHeaderText = $rootScope.settings.apiListHeaderText;
    $scope.hideFilters = $rootScope.settings.hideFilters;
    $scope.hideProductFilter = $rootScope.settings.hideProductFilter;
    $scope.hideLanguageFilter = $rootScope.settings.hideLanguageFilter;
    $scope.hideSourcesFilter = $rootScope.settings.hideSourcesFilter;

    $scope.initDefaultFilters = false;

    $scope.overviewHtml = null;
    $scope.tab = 1;


    /**
     * Private Variables
     */

    var cache = $cacheFactory.get($route.current.controller) || $cacheFactory($route.current.controller);

    /**
     * Private Functions
     */

    var setDefaultFilters = function() {
        if ($scope.initDefaultFilters) {
            // this is treated as a one shot
            $scope.initDefaultFilters = false;

            if ($rootScope.settings.defaultFilters) {
                console.log("setDefaultFilters actually setting initial filters")

                if ($rootScope.settings.defaultFilters.sources) {
                    angular.forEach($rootScope.settings.defaultFilters.sources, function (value, index) {
                        $scope.filters.sources.push(value);
                    });
                }
                if ($rootScope.settings.defaultFilters.products && $rootScope.settings.defaultFilters.products.length > 0) {
                    angular.forEach($rootScope.settings.defaultFilters.products, function (value, index) {
                        $scope.filters.products.push(value);
                    });
                }
                if ($rootScope.settings.defaultFilters.languages) {
                    angular.forEach($rootScope.settings.defaultFilters.languages, function (value, index) {
                        $scope.filters.languages.push(value);
                    });
                }
                if ($rootScope.settings.defaultFilters.types) {
                    angular.forEach($rootScope.settings.defaultFilters.types, function (value, index) {
                        $scope.filters.types.push(value);
                    });
                }
                if ($rootScope.settings.defaultFilters.keywords) {
                    $scope.filters.keywords = keywords;
                }
            }
        }
    }
    // Filters the available APIs according to selected "checkbox" filters
    var setFilteredApis = function(){

        // check to see if we need to set default filters.  only done once.
        setDefaultFilters();

        var apis = [];

        for (var x=0; x<$scope.apis.length; x++) {
            var api = $scope.apis[x];
            var add = true;

            // Process product filter
            if (add && $scope.filters.products.length) {
                if (api.products && api.products.length) {
                    for (var y=0; y<api.products.length; y++) {
                        var product = api.products[y];
                        if ($scope.filters.products.indexOf(product) === -1) {
                            add = false;
                        } else {
                            add = true;
                            break;
                        }
                    }
                } else {
                    add = false;
                }
            }

            // Process languages filter
            if (add && $scope.filters.languages.length) {

                if (api.languages && api.languages.length) {
                    for (var y=0; y<api.languages.length; y++) {
                        var language = api.languages[y];
                        if ($scope.filters.languages.indexOf(language) === -1) {
                            add = false;
                        } else {
                            add = true;
                            break;
                        }
                    }
                } else {
                    add = false;
                }
            }

            // Process types filter
            if (add && api.type == "internal") {
                add = false;
            }
            if (add && $scope.filters.types.length && $scope.filters.types.indexOf(api.type) === -1) {
                add = false;
            }

            // Process sources filter
            if (add && $scope.filters.sources.length && $scope.filters.sources.indexOf(api.source) === -1) {
                add = false;
            }

            if (add) {
                apis.push(api);
            }
        }

        // Persist the current filters
        cache.put("filters", $scope.filters);

        $scope.filteredApis = filterFilter(apis, $scope.filters.keywords);
    };

    /**
     * Private Functions - set the apis for the default products.
     */
    var setApis = function(response){
        var emptyResult = {
    		apis : [],
            filters : {
            	products : [],
            	languages : [],
                types : [],
                sources : []
            }
        };

        var result = angular.merge({}, emptyResult);

        angular.forEach(response.apis, function(value, index) {
        	var products = [];
            var languages = [];

        	if (value.products && value.products.length > 0) {
        		if (angular.isArray(value.products)) {
        			angular.forEach(value.products, function(value, index) {
        				products.push(value.replace(";", " "));
                    });
                }
        	}
        	result.filters.products.pushUnique(products, true);
            result.filters.languages.pushUnique(value.languages, true);
            result.filters.types.pushUnique(value.type);
            result.filters.sources.pushUnique(value.source);
            result.apis.push(value);

            if (value.source === 'local') {
                apis.createMethodsForProduct(value.type, value.url, "#!/apis/" + value.id, function(methods){
                    $scope.apis[index].methods = methods;
                });
            }

        });
        $scope.products = result.filters.products;
    	$scope.languages = result.filters.languages;
        $scope.types = result.filters.types;
        $scope.sources = result.filters.sources;
        $scope.apis = result.apis;
    };

    /**
     * Private Function - load the API group overview text for the default product in the config.js.
     */
    var loadAPIGroupOverview = function() {
        var useLocal = false;

        // try local first
        apis.getLocalAPIGroupOverviewPath().then(function (response) {

            var localOverviewPath = response.data;
            if (localOverviewPath && typeof localOverviewPath !== 'undefined') {
                useLocal = true;
                console.log("load API group overview from local");
                $scope.loading += 1;
                apis.getOverviewBody(localOverviewPath).then(function (response) {
                    if (response.data) {
                        $scope.overviewHtml = response.data;
                    }
                }, function (response) {
                    //error
                    console.log(response);
                }).finally(function () {
                    $scope.loading -= 1;
                });
            }

        }).finally(function () {
            if( !useLocal) {
                console.log("load API group overview from remote");
                loadRemoteAPIGroupOverview();
            }
        });
    }

    var loadRemoteAPIGroupOverview = function() {
        if ($scope.filters.products && $scope.filters.products.length > 0) {
            var apiGroup = $scope.filters.products[0];
            //console.log('group=' + apiGroup);
            var overviewApiId = null;
            if (apiGroup) {
                angular.forEach($scope.apis, function(value, index) {
                    //console.log("name=" + value.name + ", type=" + value.type);
                    if (value.type == "internal" && value.apiGroup == apiGroup.replace(" ", "-").toLowerCase()) {
                        overviewApiId = parseInt(value.id, 10);
                    }
                });
            }
            //console.log("id=" + overviewApiId);
            if (overviewApiId) {
                $scope.loading += 1;
                apis.getRemoteApiResources(overviewApiId).then(function (response) {
                    if (response) {
                        var docList = response.resources.docs;
                        var overviewResource = null;
                        if (docList) {
                            for (var i = docList.length - 1; i >= 0; --i) {
                                var resource = docList[i];
                                if (resource.categories && (resource.categories.length > 0) && (resource.categories[0] == 'API_OVERVIEW')) {
                                    overviewResource = resource;
                                    docList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        if (overviewResource) {
                            $scope.loading += 1;
                            apis.getOverviewBody(overviewResource.downloadUrl).then(function (response) {
                                if (response) {
                                    $scope.overviewHtml = response.data;
                                }
                            }, function (response) {
                                //error
                                console.log(response.data);
                            }).finally(function () {
                                $scope.loading -= 1;
                            });
                        } else {
                            $scope.overviewHtml = null;
                            $scope.tab = 2;
                        }
                    }
                }, function (response) {
                    // log error
                    console.log(response);
                }).finally(function () {
                    $scope.loading -= 1;
                });
            } else {
                $scope.tab = 2;
            }
        } else {
            $scope.tab = 2;
        }
    }

	/**
     * Private Function - convert json object to json string
     */
	$scope.getJsonStr = function(jsonObj) {
		return angular.toJson(jsonObj, true);
	}

    /**
     * Method to check to see if a given method object matches the given keywords
     * @param jsonObj
     * @param keywords
     * @returns {boolean}
     */
    $scope.methodMatchesKeywords = function(jsonObj, keywords) {
	    // this should exit with false if the keywords is empty as well
        if (!keywords || !jsonOb) {
	        return false;
        }
        // the method has varying case for terms in it.  Here we make it lower case when doing
        // the comparison so that it is case independent.  keywords is forced to be lower case
        // already.
        return angular.toJson(jsonObj, false).toLowerCase().indexOf(keywords) != -1;
    }

    /**
     * Public Functions
     */

    // Load cached filters
    if (cache.get("filters")) {
        $scope.filters = cache.get("filters");
        setFilteredApis();
    } else {
        // there are no cached filters, so we need to set the default filter
        // values after we load for the first time.
        $scope.initDefaultFilters = true;
    }

    $scope.loading += 1;

    $scope.getApis = function(enableLocal, enableRemote) {
    	if (enableLocal == true && enableRemote == true) {
        	apis.getAllApis().then(function(response) {
                setApis(response);
            }).finally(function() {
                setFilteredApis();
                loadAPIGroupOverview();
                $scope.loading -= 1;
            });
        } else if (enableLocal == false && enableRemote == true){
        	apis.getRemoteApis().then(function(response) {
                setApis(response);
            }).finally(function() {
                setFilteredApis();
                loadAPIGroupOverview();
                $scope.loading -= 1;
            });
        } else if (enableLocal == true && enableRemote == false){
        	apis.getLocalApis().then(function(response) {
                setApis(response);
            }).finally(function() {
                setFilteredApis();
                $scope.loading -= 1;
            });
        }
    };

    $scope.getApis($rootScope.settings.enableLocal, $rootScope.settings.enableRemote);

    // When the "keywords" field has changed
    $scope.keywordsChanged = function(){

        // force the keywords to lower case so that search is always case independent
        $scope.filters.keywords = $scope.filters.keywords.toLowerCase();

        // Force filtering the APIs
        setFilteredApis();
    };

    // When any "checkbox" field has changed
    $scope.toggleFilterSelection = function(value, filter) {
        var idx = filter.indexOf(value);
        if (idx > -1) {
            filter.splice(idx, 1);
        } else {
            filter.push(value);
        }

        // Force filtering the APIs
        setFilteredApis();
    };

    // Sets the active tab
    $scope.setActiveTab = function(newTab) {
        $scope.tab = newTab;
    };

    // Checks if a tab is active
    $scope.isTabActive = function(tabNum) {
        return $scope.tab === tabNum;
    };

    $scope.toggleFilterDisplay = function() {
        $scope.hideLeftNav = !$scope.hideLeftNav;
    }
});
