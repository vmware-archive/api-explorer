'use strict';

angular.module('apiExplorerApp').controller('VsphereUserSessionCtrl', function($rootScope, $scope, $window, $http, $cookies, ModalService, $sce, apis) {

    /**
     * Public Variables
     */
    $scope.loading = 0; // Loading when > 0

    /**
     * Private Variables
     */
    var cookieNameUsername = "API-EXPLORER-USER";

    $rootScope.loggedIn = (sessionStorage.getItem('vmware-api-session-id') || false);
    $rootScope.username = ($cookies.get(cookieNameUsername) || null);

    /**
     * Public Functions
     */

    $scope.vspherelogin = function() {

        ModalService.showModal({
            templateUrl : 'views/vspherelogin.html',
            controller : "VsphereLoginCtrl"
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                if (result) {
                    $rootScope.loggedIn = true;
                    $rootScope.username = result.name;
                    $cookies.put(cookieNameUsername, result.name);
                    sessionStorage.setItem('vmware-api-session-id', result.sessionId );
                }
            });
        }).catch(function(error) {

            console.log(error);
        });
        //});
    }

    $scope.loading += 1;

    $scope.vspherelogout = function() {
        apis.logout(sessionStorage.getItem('vmware-api-session-id'), $sce.trustAsResourceUrl($rootScope.settings.authApiEndPoint)).then(function(response) {

        }).finally(function() {
            $rootScope.loggedIn = false;
            $rootScope.username = null;

            $cookies.remove(cookieNameUsername);
            sessionStorage.removeItem('vmware-api-session-id');
            $scope.loading -= 1;
        });

    }

});