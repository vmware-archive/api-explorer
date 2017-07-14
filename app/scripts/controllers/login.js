'use strict';

angular.module('apiExplorerApp').controller('LoginCtrl', function($rootScope, $scope, $http, $window, $timeout, $element, $sce, apis, close) {

    $scope.loggedInUser = null;
    $scope.user = {};
    $scope.errorMsg = null;

    $scope.login = function() {
        if ($scope.loginForm.$valid) {

            apis.login($scope.user.name, $scope.user.password, $sce.trustAsResourceUrl($rootScope.settings.authApiEndPoint)).then(function(response) {
                if (response.value) {
                    console.log('have response, value=' + response.value);
                    $scope.loggedInUser = {
                        name: $scope.user.name,
                        sessionId: response.value
                    }

                    $scope.close();
                } else {
                    $scope.errorMsg = "Login is failed.";
                    $scope.statusMsg = "Login is failed.";
                    console.log("bad");
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
