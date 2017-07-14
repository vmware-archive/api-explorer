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

    $scope.overviewTemplateHtml = null;

    $scope.noOverviewMessage = "<i>No overview is available for this API.</i>";

    $scope.sso = $rootScope.settings.ssoEnabled;


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
            console.log("fetching resources for api id=" + apiIdToFetchResourcesFor )
            $scope.loading += 1;
            apis.getRemoteApiResources(apiIdToFetchResourcesFor).then(function (response) {
                if (response) {
                    var localApiResources = $scope.api.resources;
                    $scope.api.resources = response.resources; // overwrite with remote
                    if (localApiResources && localApiResources.docs && localApiResources.docs.length > 0) {
                        // iterate all local resources and overwrite any with the same title with the local version.
                        // this is probably not what we want to do long term
                        if ($scope.api.resources.docs) {
                            angular.forEach(localApiResources.docs, function (localResource, index) {
                                var found = false;
                                angular.forEach($scope.api.resources.docs, function (remoteResource, index) {
                                    //console.log("checking remote resource " + remoteResource.title)
                                    if (localResource.title == remoteResource.title) {
                                        found = true;
                                        //console.log("replacing remote resource " + localResource.title);
                                        $scope.api.resources.docs[index] = localResource;
                                    }
                                });
                                if (!found) {
                                    //console.log("appending local only resource " + localResource.title);
                                    $scope.api.resources.docs.push(localResource);
                                }
                            });
                        } else {
                            // there was no remote docs resource, just use local
                            $scope.api.resources.docs = localApiResources.docs;
                        }
                    }

                    var docList = $scope.api.resources.docs;

                    var overviewResource = null;
                    if (docList) {
                        // find the overview resource if it exists and remove it from the resources
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
                        // now we need to fetch the overview from the overviewResource.downloadUrl, merge it with the template
                        // and set it as the overview body
                        $scope.loading += 1;
                        apis.getOverviewBody(overviewResource.downloadUrl).then(function (response) {
                            if (response) {
                                //console.log("got overview body")
                                //console.log(response.data);
                                // do a find and replace on the overview template to create a new string
                                // which is the overview body for the API
                                //console.log("current scope before attempting to build overview:")
                                //console.log($scope);

                                if ($scope.overviewTemplateHtml) {
                                    //$scope.api.overviewHtml = $scope.overviewTemplateHtml.replace("OVERVIEW-BODY-PLACEHOLDER",response.data);
                                    $scope.api.overviewHtml = response.data;
                                    console.log("got completed overview html");
                                } else {
                                    // if there is no template
                                    $scope.api.overviewHtml = response.data;
                                }
                            }
                        }, function (response) {
                            //error
                            console.log(response.data);
                        }).finally(function () {
                            $scope.loading -= 1;
                        });
                    } else {
                        //$scope.api.overviewHtml = $scope.overviewTemplateHtml.replace("OVERVIEW-BODY-PLACEHOLDER",noOverviewMessage);
                        $scope.api.overviewHtml = null;//$scope.noOverviewMessage;

                        $scope.tab = 2;
                    }

                    // categories are the values that we are going to pass to the sample search service
                    // to search for matching samples.
                    categories = ""

                    // include the UID of this API in the sample search as a platform value.
                    if ($scope.api.api_uid) {
                        categories = $scope.api.api_uid;
                    }
                    if ($scope.api.name) {
                        if (categories.length == 0) {
                            categories = $scope.api.name;
                        } else {
                            categories += "," + $scope.api.name;
                        }
                    }

                    // Use any category value from any SDK that was included
                    // in the list of SDKs.
                    var idx = 0;
                    angular.forEach(response.resources.sdks, function (sdk, index) {
                        var category = sdk.categories[0];

                        if (categories.length == 0) {
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
                            //error
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

                //set API preferences default
                $scope.api.preferences = {
                    host: '',
                    basePath: ''
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
    var loadApis = function () {
        $scope.loading += 1;
        console.log("loading APIs in details...");
        apis.getAllApis().then(function (response) {
            $scope.apis = response.apis;
        }).finally(function () {
            setSelectedApi();
            $scope.loading -= 1;
        });
    }

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

    loadApis();

    // the actual code that starts the initialization chain, load the overview-template.html,
    // then fetch all APIs
    // $scope.loading += 1;
    // apis.getLocalOverviewTemplate().then(function (response) {
    //     $scope.overviewTemplateHtml = response.data;
    //     console.log("setting overviewTemplateHtml");
    //     //console.log($scope.overviewTemplateHtml);
    //
    //     //console.log("current scope after setting overviewTemplateHtml:")
    //     //console.log($scope);
    //
    // }).finally(function () {
    //     loadApis();
    //     $scope.loading -= 1;
    // });


});
