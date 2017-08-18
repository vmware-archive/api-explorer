'use strict';

angular.module('apiExplorerApp').controller('VsphereLoginCtrl', function($rootScope, $scope, $http, $window, $timeout, $element, $sce, apis, close) {

    $scope.loggedInUser = null;
    $scope.user = {};
    $scope.errorMsg = null;

    $scope.login = function() {
        if ($scope.loginForm.$valid) {

            apis.vspherelogin($scope.user.name, $scope.user.password, $sce.trustAsUrl($rootScope.settings.authApiEndPoint)).then(function(response) {
                if (response.value) {
                    console.log('have response, value=' + response.value);
                    $scope.loggedInUser = {
                        name: $scope.user.name,
                        sessionId: response.value
                    }

                    $scope.close();
                } else {
                    $scope.errorMsg = "Login failed.";
                    $scope.statusMsg = "Login failed.";
                    console.log("failed login response." + response);
                    $timeout(function() {
                        $scope.errorMsg = null;
                    }, 5000);
                }
            }).finally(function() {
                console.log('In final');

            });
        }
    }

    // Close the dialog
    $scope.close = function() {
        $element.modal('hide');
        close($scope.loggedInUser, 500);
    };
});
