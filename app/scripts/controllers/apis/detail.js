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

    // Return the currently selected API (if available)
    var setSelectedApi = function(){
    	var selectedApi = $routeParams.id ? filterFilter($scope.apis, {id: parseInt($routeParams.id, 10)}, true)[0] : null;

        if (selectedApi) {

            if (!$scope.api || ($scope.api && $scope.api.id !== selectedApi.id)) {
                $scope.api = selectedApi;

                var categories = null;
                //Get selected API resources
                if ($scope.api.source == 'remote' && $scope.api.url) {
                	$scope.loading += 1;
                	apis.getRemoteApiResources($scope.api.id).then(function(response) {
                        if (response) {
                        	$scope.api.resources = response.resources;
                        	var idx = 0;
                        	angular.forEach(response.resources.sdks, function(sdk, index) {
                                var category = sdk.categories[0];
                                
                                if (idx == 0) {
                                	categories = category;
                                } else {
                                	categories += "," + category;
                                }
                                idx++;
                            });
                        	if (categories) {
                        		apis.getSamples(categories).then(function(response) {
                                    if (response) {
                                    	$scope.api.resources.samples = response.data;
                                    }
                                }, function(response) {
                                   	console.log(response.data);
                                }).finally(function() {
                                    
                                });

                            }
                        } 
                    }, function(response) {
                    	// log error
                    	console.log(response);
                    }).finally(function() {
                        $scope.loading -= 1;
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
