/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

var env = {};

//Import variables if present (from config.js)
if (window && window.config) {
    env = window.config;
}

var app = angular.module('apiExplorerApp', [ 'ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', 'angular.filter', 'angularModalService', 'environment', 'base64' ]).config(
		function($compileProvider, $routeProvider, $httpProvider, envServiceProvider, $logProvider) {

          // Disable debug info
          $compileProvider.debugInfoEnabled(false);

          $logProvider.debugEnabled(env.enableDebug);

          // Enable HTTP caching by default
          $httpProvider.defaults.cache = true;

          $routeProvider.when('/apis', {
              templateUrl : 'views/apis/list.html',
              controller : 'ApisListCtrl'
          }).when('/apis/:id?', {
              templateUrl : 'views/apis/detail.html',
              controller : 'ApisDetailCtrl',
              reloadOnSearch: false
          }).otherwise({
              redirectTo : '/apis'
          });

      });

//Register environment in AngularJS as constant
app.constant('env', config);

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
      //console.log("$window.apiExplorer.currentPath='" + $window.apiExplorer.currentPath + "'");
      //console.log("$window.location.pathname='" + $window.location.pathname + "'");
      //console.log("$rootScope.settings.currentPath='" + $rootScope.settings.currentPath + "'");

      // Determine the "endpoint" used for loading remote APIs
      $rootScope.settings.remoteApisEndpoint =  env.remoteApiEndPoint;
      $rootScope.settings.remoteSampleExchangeApiEndPoint =  env.remoteSampleExchangeApiEndPoint;

      // Determine the "endpoint" used for loading local APIs
      $rootScope.settings.localApisEndpoint = env.localApiEndPoint;

      // Determine if enable local APIs
      $rootScope.settings.enableLocal = env.enableLocal;

      // Determine if enable remote APIs
      $rootScope.settings.enableRemote = env.enableRemote;

      // set any default filter selections
      $rootScope.settings.defaultFilters = env.defaultFilters;

      // defaults for control over the filter pane
      $rootScope.settings.hideFilters = env.hideFilters;
      $rootScope.settings.hideProductFilter = env.hideProductFilter;
      $rootScope.settings.hideLanguageFilter = env.hideLanguageFilter;
      $rootScope.settings.hideSourcesFilter = env.hideSourcesFilter;

      // text displayed above the API list
      $rootScope.settings.apiListHeaderText = env.apiListHeaderText;

      // sso
      $rootScope.settings.ssoEnabled = env.ssoEnabled;
      $rootScope.settings.authApiEndPoint = env.authApiEndPoint;

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




