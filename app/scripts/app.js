/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

var app = angular.module('apiExplorerApp', [ 'ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', 'angular.filter', 'environment' ]).config(
        function($compileProvider, $routeProvider, $httpProvider, envServiceProvider) {

            // Disable debug info
            $compileProvider.debugInfoEnabled(false);

            // Enable HTTP caching by default
            $httpProvider.defaults.cache = true;

            $routeProvider.when('/apis', {
                templateUrl : 'views/apis/list.html',
                controller : 'ApisListCtrl'
            }).when('/apis/:id?', {
                templateUrl : 'views/apis/detail.html',
                controller : 'ApisDetailCtrl'
            }).otherwise({
                redirectTo : '/apis'
            });

        });

app.run(function($rootScope, $window) {

    var initSettings = function() {

        // If the app is embedded, we can overwrite certain properties
        $window.apiExplorer = $window.apiExplorer || {};
        $rootScope.settings = {};

        // Determine the "path" used for loading "external" but local resources (by default current index.html path)
        $rootScope.settings.currentPath = $window.apiExplorer.currentPath || $window.location.pathname.slice(0, $window.location.pathname.lastIndexOf("/"));

        // Add the trailing forward slash to the "current path", if needed
        if (!$rootScope.settings.currentPath.endsWith("/")) {
            $rootScope.settings.currentPath += "/";
        }

        // Determine the "endpoint" used for loading remote APIs
        $rootScope.settings.remoteApisEndpoint = $window.apiExplorer.remoteApisEndpoint || "https://dc-test-repo1.eng.vmware.com:8443"; //"https://dc-test-repo1:8443/dcr/rest/staging/artifacts/v1/apidoc?state=staged";

        // Determine the "endpoint" used for loading local APIs
        $rootScope.settings.localApisEndpoint = $window.apiExplorer.localApisEndpoint || ($rootScope.settings.currentPath + "db/local.json");

    };

    // Initialize global settings
    initSettings();

    // Track any route change as a Google Analytics pageview (if GA is available)
    $rootScope.$on('$routeChangeSuccess', function() {
        var url = $window.location.pathname + $window.location.search + $window.location.hash;
        if ($window.ga) {
            $window.ga('send', 'pageview', {
                page : url
            });
        } else if ($window._gaq) {
            $window._gaq.push([ '_trackPageview', url ]);
        }
    });

});
