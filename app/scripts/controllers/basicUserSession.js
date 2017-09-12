'use strict';

angular.module('apiExplorerApp').controller('BasicUserSessionCtrl', function($rootScope, $scope, $window, $http, $cookies, ModalService, $sce, apis) {

    /**
     * Public Variables
     */
    $scope.loading = 0; // Loading when > 0

    /**
     * Private Variables
     */
    var cookieNameUsername = "API-EXPLORER-USER";

    $rootScope.loggedIn = (sessionStorage.getItem('basic-username') || false);
    $rootScope.username = ($cookies.get(cookieNameUsername) || null);

    /**
     * Public Functions
     */

    $scope.basiclogin = function() {

        ModalService.showModal({
            templateUrl : 'views/basiclogin.html',
            controller : "BasicLoginCtrl"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result) {
                    console.log("Basic auth login.");
                    $rootScope.loggedIn = true;
                    $rootScope.username = result.name;
                    $cookies.put(cookieNameUsername, result.name);
                    sessionStorage.setItem('basic-username', result.name );
                    sessionStorage.setItem('basic-password', result.password );
                    sessionStorage.setItem('swagger-auth-name', $rootScope.settings.swaggerAuthName );
                }
            });
        }).catch(function(error) {

            console.log(error);
        });
        //});
    }

    $scope.loading += 1;

    $scope.basiclogout = function() {
        console.log("Basic auth logout.");
        $rootScope.loggedIn = false;
        $rootScope.username = null;
        $rootScope.password = null;

        $cookies.remove(cookieNameUsername);
        sessionStorage.removeItem('basic-username');
        sessionStorage.removeItem('basic-password');
        $scope.loading -= 1;
    };
});