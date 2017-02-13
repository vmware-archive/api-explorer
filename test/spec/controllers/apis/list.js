/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

describe('Controller: ApisListCtrl', function() {
	var ApisListCtrl, route, apiService;
	var $rootScope, $scope, $q;
	var deferred;
	
	var localApis = [ {
        "name" : "vRealize Automation REST API",
        "version" : "7",
        "url" : "db/swagger/api-vra-7.json",
        "products": ["vRealize Suite 7.0"],
        "languages" : ["Java"],
        "type" : "Swagger",
        "source" : "local"
    }, {
        "name" : "vCenter Server Appliance API",
        "version" : "",
        "url" : "db/swagger/appliance.json",
        "products": ["vSphere 6.5"],
        "languages" : ["Java"],
        "source" : "local"
    }]

	var remoteApis = [ {
        "name" : "vCenter API",
        "version" : "",
        "url" : "db/swagger/vcenter.json",
        "products": ["vCenter;6.5"],
        "languages" : [".NET"],
        "type" : "Swagger"
    }, {
        "name" : "NSX for vSphere API",
        "version" : "6.2.3",
        "url" : "https://raw.githubusercontent.com/vmware/nsxraml/master/nsxvapi.raml",
        "products": ["NSX"],
        "languages" : ["Java"],
        "type" : "Swagger"
    }]
	
	var allApis = localApis.concat(remoteApis);
	    
	// load the controller's module
    beforeEach(module('apiExplorerApp'));
	
    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$rootScope_, $route, _$q_, apis) {
    	$rootScope = _$rootScope_;
    	$scope = _$rootScope_.$new();
        $route.current = {};
        route = $route;
        $q = _$q_;

        // We use the $q service to create a mock instance of defer
        deferred = _$q_.defer();
        
        // Use a Jasmine Spy to return the deferred promise
        spyOn(apis, 'getAllApis').and.returnValue(deferred.promise);
        spyOn(apis, 'getLocalApis').and.returnValue(deferred.promise);
        spyOn(apis, 'getRemoteApis').and.returnValue(deferred.promise);
        
        ApisListCtrl = $controller('ApisListCtrl', {
        	$scope : $scope,
            $route : route,
            apis : apis
        });
    }));

    describe('load config', function() {
        it('local API should be defined', function() {
        	expect($scope.settings.enableLocal).toBeDefined();
        });
        it('local Api endpoint should exist if local api is enabled', function() {
        	if ($scope.settings.enableLocal == true) {
            	expect($scope.settings.localApisEndpoint).toBeDefined();
            }
        });
        it('remote API should be defined', function() {
        	expect($scope.settings.enableRemote).toBeDefined();
        });
        it('remote Api endpoint should exist if remote api is enabled', function() {
        	if ($scope.settings.enableRemote == true) {
            	expect($scope.settings.remoteApisEndpoint).toBeDefined();
            }
        });
    });

    describe('load default apis', function() {
    	it('should not be null on initial load', function() {
    		expect($scope.apis).not.toBeNull();
    	});
    	it('products filter should be empty on initial load', function() {
    		expect($scope.filters.products.length).toEqual(0);
    	});
    	it('languages filter should be empty on initial load', function() {
    		expect($scope.filters.languages.length).toEqual(0);
    	});
    	it('types filter should be empty on initial load', function() {
    		expect($scope.filters.types.length).toEqual(0);
    	});
    	it('sources filter should be empty on initial load', function() {
    		expect($scope.filters.sources.length).toEqual(0);
    	});
    });
  
    describe('get apis', function() {
    	var emptyResult = {
    		apis : [],
    		filters : {
                products : [],
                languages : [],
                types : [],
                sources : []
            }
        };
    	
        it('should get all apis', function () {
        	$scope.getApis(true, true);
        	var result = angular.merge({}, emptyResult);
            result.apis = allApis;
            deferred.resolve(result);
            $scope.$apply();
            expect($scope.apis).not.toBe(undefined);
            expect($scope.error).toBe(undefined);
            expect($scope.apis.length).toEqual(4);
    	});
    	
    	it('should get local apis', function () {    		
    		$scope.getApis(true, false);
    		var result = angular.merge({}, emptyResult);
            result.apis = localApis;
            deferred.resolve(result);
            $scope.$apply();
            expect($scope.apis).not.toBe(undefined);
            expect($scope.error).toBe(undefined);
            expect($scope.apis.length).toEqual(2);
    	});
    	
    	it('should get all remote apis', function () {    		
    		$scope.getApis(false, true);
    		var result = angular.merge({}, emptyResult);
            result.apis = remoteApis;
            deferred.resolve(result);
            $scope.$apply();
            expect($scope.apis).not.toBe(undefined);
            expect($scope.error).toBe(undefined);
            expect($scope.apis.length).toEqual(2);
        });
    	
        it('should get vCenter 6.5 remote apis', function () {    		
        	$scope.getApis(false, true, 'vCenter');
    		var result = angular.merge({}, emptyResult);
    		result.apis = remoteApis;
            deferred.resolve(result);
            $scope.$apply();
            expect($scope.apis).not.toBe(undefined);
            expect($scope.error).toBe(undefined);
            expect($scope.apis.length).toEqual(1);
        });
    });
    
    describe('filter the apis', function() {
    	it('should return 1 vSphere api', function() {
    		$scope.apis = allApis;
    	    $scope.filters.products = ['vSphere 6.5']; 
    	    var filter = [];
    	    var value = 'product';
    	    $scope.toggleFilterSelection(value, filter);
    	    expect($scope.filteredApis.length).toEqual(1);
    	});
    	
    	it('should return 3 Java apis', function() {
    		$scope.apis = allApis;
    		$scope.filters.languages = ['Java']; 
    	    var filter = [];
    	    var value = 'language';
    	    $scope.toggleFilterSelection(value, filter);
    	    expect($scope.filteredApis.length).toEqual(3);
    	});
    	
    	it('should return 3 swagger api', function() {
    		$scope.apis = allApis;
    		$scope.filters.types = ['Swagger']; 
    	    var filter = [];
    	    var value = 'type';
    	    $scope.toggleFilterSelection(value, filter);
    	    expect($scope.filteredApis.length).toEqual(3);
    	});
    	
    	it('should return 2 local api', function() {
    		$scope.apis = allApis;
    		$scope.filters.sources = ['local']; 
    	    var filter = [];
    	    var value = 'source';
    	    $scope.toggleFilterSelection(value, filter);
    	    expect($scope.filteredApis.length).toEqual(2);
    	});
    });
});