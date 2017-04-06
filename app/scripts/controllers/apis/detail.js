/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

angular.module('apiExplorerApp').controller('ApisDetailCtrl', function($rootScope, $scope, $http, $window, $timeout, $route, $routeParams, $q, $sce, filterFilter, apis) {

    /**
     * Public Variables
     */

    $scope.loading = 0; // Loading when > 0
    $scope.apis = [];
    $scope.api = null;
    $scope.tab = 1;
    $scope.showPreferences = false;

    /**
     * Private Variables
     */

    // RegEx to validate if a URL is absolute
    var absoluteUrl = new RegExp('^(?:[a-z]+:)?//', 'i');

    /**
     * Private Functions
     */
    // Load resources for the currently selected API for the given remote API id
    var loadResourcesForRemoteApi = function(apiIdToFetchResourcesFor) {
        var categories = null;
        if (apiIdToFetchResourcesFor) {
            console.log("fetching resources for api id=" + apiIdToFetchResourcesFor)
            $scope.loading += 1;
            apis.getRemoteApiResources(apiIdToFetchResourcesFor).then(function (response) {
                if (response) {
                    $scope.api.resources = response.resources;
                    var idx = 0;
                    angular.forEach(response.resources.sdks, function (sdk, index) {
                        var category = sdk.categories[0];

                        if (idx == 0) {
                            categories = category;
                        } else {
                            categories += "," + category;
                        }
                        idx++;
                    });
                    if (categories) {
                        apis.getSamples(categories).then(function (response) {
                            if (response) {
                                $scope.api.resources.samples = response.data;
                            }
                        }, function (response) {
                            console.log(response.data);
                        }).finally(function () {

                        });

                    }
                }
            }, function (response) {
                // log error
                console.log(response);
            }).finally(function () {
                $scope.loading -= 1;
            });
        } else {
            console.log("apiIdToFetchResourcesFor is null");
        }
    }

    // Return the currently selected API (if available)
    var setSelectedApi = function(){
    	var selectedApi = $routeParams.id ? filterFilter($scope.apis, {id: parseInt($routeParams.id, 10)}, true)[0] : null;

        if (selectedApi) {

            if (!$scope.api || ($scope.api && $scope.api.id !== selectedApi.id)) {
                $scope.api = selectedApi;

                // if there is no overview resource, then default the tab to the api reference and not the overview
                if ((!$scope.api.resources || ! $scope.api.resources.overview) && ($scope.tab == 1)) {
                    $scope.tab = 2;
                }

                //Get selected API resources.  There are two cases, a remote API, and then a local API that
                // specifies an api_uid string.  In the case of a local API, we use the UID to get the latest
                // instance of the remote API and then get the resources for it.
                if ($scope.api.url && $scope.api.source == 'remote') {
                    loadResourcesForRemoteApi( $scope.api.id );
                } else if ($scope.api.url && $scope.api.source == 'local' && $scope.api.api_uid) {
                     console.log("fetching resources for api_uid=" + $scope.api.api_uid)

                     apis.getLatestRemoteApiIdForApiUid($scope.api.api_uid).then(function(response) {
                         // response.data should have the id.  Might be null
                         //console.log("got response for getLatestRemoteApiIdForApiUid");
                         //console.log(response);
                         loadResourcesForRemoteApi( response.data );
                    });
                }

                if ($scope.api.type === "swagger") {
                    // Load swagger's JSON definition to read the default "preferences"
                	if ($scope.api.url) {
                		$scope.loading += 1;
                        var apiUrl = (absoluteUrl.test($scope.api.url) ? "" : $rootScope.settings.currentPath) + $scope.api.url;

                        $http.get(apiUrl).then(function(response){
                            $scope.api.preferences = {
                                host: response.data.host,
                                basePath: response.data.basePath
                            }
                        }).finally(function(){
                            $scope.loading -= 1;
                        });
                	}
                }
            }
        }

    };

    /**
     * Public Functions
     */

    $scope.loading += 1;
    apis.getAllApis().then(function(response) {
        $scope.apis = response.apis;
    }).finally(function() {
        setSelectedApi();
        $scope.loading -= 1;
    });

    // Updates the API preferences
    $scope.updatePreferences = function(type){
        $scope.loading += 1;
        $scope.api[type + "Preferences"] =  angular.copy($scope.api.preferences);
        $timeout(function(){
            $scope.loading -= 1;
        }, 500);
    };

    // Toggles the detail view preferences
    $scope.togglePreferences = function(){
        $scope.showPreferences = !$scope.showPreferences;
    };

    // Convert URLs to trusted URLs (XSS related)
    $scope.getTrustedUrl = function(url){
        return $sce.trustAsResourceUrl(url);
    };

    // Sets the active tab
    $scope.setActiveTab = function(newTab) {
        $scope.tab = newTab;
    };

    // Checks if a tab is active
    $scope.isTabActive = function(tabNum) {
        return $scope.tab === tabNum;
    };

    // SDK tag filter
    $scope.filterTag = function(tag) {
    	return (tag.category === 'platform' || tag.category === 'programming-language');
    };

});
