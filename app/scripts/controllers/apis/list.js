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

    /**
     * Private Variables
     */

    var cache = $cacheFactory.get($route.current.controller) || $cacheFactory($route.current.controller);

    /**
     * Private Functions
     */

    // Filters the available APIs according to selected "checkbox" filters
    var setFilteredApis = function(){
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
     * Private Functions - 
     */
    var setApis = function(response){
    	$scope.products = response.filters.products;
    	$scope.languages = response.filters.languages;
        $scope.types = response.filters.types;
        $scope.sources = response.filters.sources;
        $scope.apis = response.apis;
    };

    /**
     * Public Functions
     */

    // Load cached filters
    if (cache.get("filters")) {
        $scope.filters = cache.get("filters");
        setFilteredApis();
    }

    $scope.loading += 1;
    
    if ($rootScope.settings.enableLocal == true && $rootScope.settings.enableRemote == true) {
    	apis.getAllApis().then(function(response) {
            setApis(response);
        }).finally(function() {
            setFilteredApis();
            $scope.loading -= 1;
        });
    } else if ($rootScope.settings.enableLocal == false && $rootScope.settings.enableRemote == true){
    	apis.getRemoteApis().then(function(response) {
            setApis(response);
        }).finally(function() {
            setFilteredApis();
            $scope.loading -= 1;
        });
    } else if ($rootScope.settings.enableLocal == true && $rootScope.settings.enableRemote == false){
    	apis.getLocalApis().then(function(response) {
            setApis(response);
        }).finally(function() {
            setFilteredApis();
            $scope.loading -= 1;
        });
    }

    // When the "keywords" field has changed
    $scope.keywordsChanged = function(){
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

});