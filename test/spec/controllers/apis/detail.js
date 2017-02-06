/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
'use strict';

describe('Controller: ApisDetailCtrl', function() {
	var ApisDetailCtrl, route, element, template;
	var $rootScope, $scope;

	// load the controller's module
    beforeEach(module('apiExplorerApp'));
    //beforeEach(module('apiExplorerApp.templates'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, _$rootScope_, _$compile_, $templateCache ) {
    	$rootScope = _$rootScope_;
    	$scope = _$rootScope_.$new();
    	//template = $templateCache.get('views/apis/detail.html');
    	
        ApisDetailCtrl = $controller('ApisDetailCtrl', {
        	$scope : $scope,
        	$route : route
        });
    }));

    describe('load the selected api', function() {
    	var selectedApi = {
    			"id" :1,
    			"name" : "NSX for vSphere API",
                "version" : "6.2.3",
                "url" : "https://raw.githubusercontent.com/vmware/nsxraml/master/nsxvapi.raml",
                "products": ["NSX"],
                "languages" : ["Java"],
                "type" : "Swagger",
                "resources": {
                    "samples": [
                        {
                            "title": "vCheck vSphere",
                            "url": "http://developercenter.vmware.com/samples/823/-vcheck-vsphere"
                        }, {
                            "title": "Ghetto VCB",
                            "url": "http://developercenter.vmware.com/samples/822/ghetto-vcb"
                        }
                    ],
                    "sdks": [
                        {
                            "title": "VMware vCloud Suite SDK for Perl for vSphere 6.0",
                            "url": "http://developercenter.vmware.com/web/sdk/60/vcloudsuite-perl"
                        }
                    ]
                }
        }
    	
    	it('should show api ref tab', function() {
    		$scope.api = selectedApi;
    		expect($scope.api).not.toBeNull();
    		expect($scope.tab).toEqual(1);
    		expect($scope.api.url).not.toBeNull();
    	});
    	
    	it('should not show docs tab', function() {
    		$scope.api = selectedApi;
    		expect($scope.api.resources.docs).not.toBeDefined();
    		expect($scope.isTabActive(2)).toEqual(false);
    	});
    	
    	it('should show sdks tab', function() {
    		$scope.api = selectedApi;
    		$scope.setActiveTab(3);
    		expect($scope.isTabActive(3)).toEqual(true);
    		expect($scope.api.resources.sdks).not.toBeNull();
    		expect($scope.api.resources.sdks.length).toEqual(1);
    	});
    	
    	it('should show samples tab', function() {
    		$scope.api = selectedApi;
    		$scope.setActiveTab(4);
    		expect($scope.isTabActive(4)).toEqual(true);
    		expect($scope.api.resources.samples).not.toBeNull();
    		expect($scope.api.resources.samples.length).toEqual(2);
    	});
    });
});