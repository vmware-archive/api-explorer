'use strict';

angular.module('apiExplorerApp').controller('BasicLoginCtrl', function($rootScope, $scope, $http, $window, $timeout, $element, $sce, apis, close) {

    $scope.loggedInUser = null;
    $scope.user = {};
    $scope.errorMsg = null;

    $scope.basiclogin = function() {
        if ($scope.loginForm.$valid) {
            $scope.loggedInUser = {
                name: $scope.user.name,
                password: $scope.user.password
            }
            $scope.close();
        }
    }

    // Close the dialog
    $scope.close = function() {
        $element.modal('hide');
        close($scope.loggedInUser, 500);
    };
});
