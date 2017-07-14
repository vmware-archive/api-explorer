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
    var ABSOLUTE_URL_RE = new RegExp('^(?:[a-z]+:)?//', 'i');

    var prepareApiResources = function(remoteResources) {

        // if there are no remote resources, then simply create an empty container
        if (! remoteResources ) {
            console.log("No remote resources to merge.");
            remoteResources = {docs:[],sdks:[]};
        }

        // we are going to swap out the local resources with the remote resources, but then for the docs
        // iterate the docs and
        var localApiResources = $scope.api.resources;
        $scope.api.resources = remoteResources; // overwrite with remote

        if (localApiResources && localApiResources.docs && localApiResources.docs.length > 0) {
            console.log("Merging local API resource docs");
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

        if (localApiResources && localApiResources.sdks && localApiResources.sdks.length > 0) {
            console.log("Merging local API resource sdks");
            // iterate all local resources and overwrite any with the same title with the local version.
            // this is probably not what we want to do long term
            if ($scope.api.resources.sdks) {
                angular.forEach(localApiResources.sdks, function (localResource, index) {
                    var found = false;
                    angular.forEach($scope.api.resources.sdks, function (remoteResource, index) {
                        //console.log("checking remote resource " + remoteResource.title)
                        if (localResource.title == remoteResource.title) {
                            found = true;
                            //console.log("replacing remote resource " + localResource.title);
                            $scope.api.resources.sdks[index] = localResource;
                        }
                    });
                    if (!found) {
                        //console.log("appending local only resource " + localResource.title);
                        $scope.api.resources.sdks.push(localResource);
                    }
                });
            } else {
                // there was no remote docs resource, just use local
                $scope.api.resources.sdks = localApiResources.sdks;
            }
        }

        var docList = $scope.api.resources.docs;
        var overviewResource = null;
        if (docList) {
            // find the overview resource if it exists and remove it from the resources
            for (var i = docList.length - 1; i >= 0; --i) {
                var resource = docList[i];
                if (resource.categories && (resource.categories.length > 0) && (resource.categories[0] == 'API_OVERVIEW')) {
                    console.log("Removing API_OVERVIEW from resource list.");
                    overviewResource = resource;
                    docList.splice(i, 1);
                    break;
                }
            }
            if (docList.length == 0) {
                $scope.api.resources.docs = null;
            }
        }
        loadOverviewHtml(overviewResource);

        // categories are the values that we are going to pass to the sample search service
        // to search for matching samples.
        var categories = "";

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
        if ($scope.api.resources.sdks) {
            var idx = 0;
            angular.forEach($scope.api.resources.sdks, function (sdk, index) {
                var category = sdk.categories[0];

                if (categories.length == 0) {
                    categories = category;
                } else {
                    categories += "," + category;
                }
                idx++;
            });
        }
        if (categories) {
            // asynchronously fetch samples
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
        console.log("Done loading API.");
        $scope.api.isLoaded = true;
    }

    var loadOverviewHtml = function(overviewResource) {
        if (overviewResource) {
            // now we need to fetch the overview from the overviewResource.downloadUrl, merge it with the template
            // and set it as the overview body
            $scope.loading += 1;
            apis.getOverviewBody(overviewResource.downloadUrl).then(function (response) {
                if (response.data) {
                    console.log("got overview HTML");
                    //console.log(response);

                    $scope.api.overviewHtml = response.data;

                    // if ($scope.overviewTemplateHtml) {
                    //     //$scope.api.overviewHtml = $scope.overviewTemplateHtml.replace("OVERVIEW-BODY-PLACEHOLDER",response.data);

                } else {
                    console.log("Failed to get overview.");
                    console.log(response);
                    $scope.api.overviewHtml = null;
                    $scope.tab = 2;
                }
            }, function (response) {
                //error
                console.log(response.data);
            }).finally(function () {
                $scope.loading -= 1;
            });
        } else {
            console.log("There is no overview.");
            $scope.api.overviewHtml = null;
            $scope.tab = 2;
        }
    }

    /**
     * On input it is assumed that $scope.api already contains
     * Load resources for the currently selected API for the given remote API id
    *
    * @param apiIdToFetchResourcesFor
    */
    var loadResourcesForRemoteApi = function(apiIdToFetchResourcesFor) {
        if (apiIdToFetchResourcesFor) {
            console.log("fetching resources for api id=" + apiIdToFetchResourcesFor );
            $scope.loading += 1;
            apis.getRemoteApiResources(apiIdToFetchResourcesFor).then(function (response) {
                prepareApiResources(response.resources);
            }).finally(function () {
                $scope.loading -= 1;
            });
        } else {
            console.log("skipping resource fetch, id is null.");
            prepareApiResources(null);
        }
    };

    // Return the currently selected API (if available)
    var setSelectedApi = function(){

    	var selectedApi = $routeParams.id ? filterFilter($scope.apis, {id: parseInt($routeParams.id, 10)}, true)[0] : null;

    	// if the hash contains a query arg, this is used for a URL to a particular method.  In this case forcibly set
        // the active tab to the API reference.
        if ($window.location.hash && $window.location.hash.contains("?")) {
            console.log("hash contains query arg, forcing API reference tab active.");
            $scope.tab = 2;
        }

        if (selectedApi) {

            if (!$scope.api || ($scope.api && $scope.api.id !== selectedApi.id)) {
                // because we mutate the api with removing resources and merging remote resources into it possibly,
                // we make a copy here.
                $scope.api = angular.copy(selectedApi);

                if ( true ) { //! $scope.api.isLoaded
                    console.log("Starting load for API.");

                    //Get selected API resources.  There are two cases, a remote API, and then a local API that
                    // specifies an api_uid string.  In the case of a local API, we use the UID to get the latest
                    // instance of the remote API and then get the resources for it.
                    if ($scope.api.url && $scope.api.source == 'remote') {
                        console.log("fetching remote resources for remote api");
                        loadResourcesForRemoteApi($scope.api.id);
                    } else if ($scope.api.url && $scope.api.source == 'local') {
                        if ($scope.api.api_uid) {
                            console.log("fetching remote resources for local api_uid=" + $scope.api.api_uid);
                            apis.getLatestRemoteApiIdForApiUid($scope.api.api_uid).then(function (response) {
                                // response.data should have the id.  Might be null
                                loadResourcesForRemoteApi(response.data);
                            }).finally(function () {
                            });
                        } else {
                            // response.data should have the id.  Might be null
                            console.log("No api_uid. synchronizing local resources.");
                            loadResourcesForRemoteApi(null);
                        }

                    }

                    if ($scope.api.type === "swagger") {
                        // Load swagger's JSON definition to read the default "preferences"
                        if ($scope.api.url) {
                            $scope.loading += 1;
                            var apiUrl = (ABSOLUTE_URL_RE.test($scope.api.url) ? "" : $rootScope.settings.currentPath) + $scope.api.url;

                            // FIXME this is a redundant fetch of the swagger.json file (redundant with search as well as with
                            // the swagger html page fetching it as well. Figure out a way to get it once.
                            $http.get(apiUrl).then(function (response) {
                                $scope.api.preferences = {
                                    host: response.data.host,
                                    basePath: response.data.basePath
                                }
                            }).finally(function () {
                                $scope.loading -= 1;
                            });
                        }
                    }
                } else {
                    console.log("API resources are already loaded.");
                }
            }
        }
    };

    /**
     * Public Functions
     */
    var loadApis = function () {

        //var search = $routeParams.search;
        //console.log("routeParams.search='" + search + "'");
        console.log("calling loadApis, tab=" + $scope.tab); //FIXME delete this

        $scope.loading += 1;
        console.log("loading APIs in details...");
        apis.getAllApis().then(function (response) {
            $scope.apis = response.apis;
        }).finally(function () {
            setSelectedApi();
            $scope.loading -= 1;
        });
    };

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

    // start the initialization chain
    loadApis();
});
