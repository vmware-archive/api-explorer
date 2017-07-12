/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
app.directive('iframeAutoSize', [ function() {
    return {
        priority: -1,
        restrict : 'A',
        link : function(scope, element, attrs) {
            var iframeDocument;
            var minHeight = element.height(); // The iframe should never be shorter then the original height

            var attachResizeHandler = function(){
                angular.element(iframeDocument).one('click keyup hashchange popstate mouseenter mouseleave', $.throttle(resize));
            };

            var resize = function() {
                attachResizeHandler();
                var _resize = function() {
                    var height = Math.max(iframeDocument.body.offsetHeight + 100, minHeight) + 'px';
                    element.css('height', height);
                }

                _resize();
                for (var i = 1; i <= 10; i++) {
                    setTimeout(_resize, 100 * i); // Every 100ms up to 1000ms
                    setTimeout(_resize, 1000 * i + 2); // Every 1s (starting from 2s) up to 12s
                }

            };

            element.on('load', function() {

                // Save the iframe's document reference
                try {
                    iframeDocument = element[0].contentWindow.document;
                } catch (e) {
                    element.off('load');
                    console.log("Unable to auto size iframe");
                }

                if (iframeDocument) {

                    // If we are going to auto-size the iframe then disable the overflow as it should no longer be needed
                    angular.element(iframeDocument).find("html").css("overflow", "hidden");

                    setTimeout(resize, 0);
                }
            });

            // Cleanup
            scope.$on('$destroy', function() {
                angular.element(iframeDocument).remove();
            });
        }
    }
} ]);


app.directive('localIframe', ['$http', '$rootScope', '$window', function($http, $rootScope, $window) {
    return {
        restrict : 'A',
        scope:{
            localIframe: '@localIframe'
        },
        link : function(scope, element, attrs) {

            if (attrs.localIframe) {
                // aaron note, currentPath ends in a trailing sep
                var url = attrs.localIframe.indexOf("/") === 0 ? ($window.location.origin + $rootScope.settings.currentPath + attrs.localIframe.substr(1)) : attrs.localIframe;

                //console.log("directive: $window.location.origin='" + $window.location.origin + "'");
                //console.log("directive: $rootScope.settings.currentPath='" + $rootScope.settings.currentPath + "'");
                //console.log("directive: attrs.localIframe='" + attrs.localIframe + "'");
                console.log("localIframe: url='" + url + "'");

                $http({
                    method : 'GET',
                    url : url
                }).then(function(response) {
                    setTimeout(function(){
                        var iframeDocument = element[0].contentWindow.document;
                        var content = response.data;
                        iframeDocument.open('text/html');
                        iframeDocument.write(content);
                        iframeDocument.close();

                        // Add the queryString parameters of the original URL as a hash to the new iframe
                        var split = url.split("?");
                        if (split.length > 1) {
                            iframeDocument.location.hash = split[1];
                        }

                    }, 0);
                });
            }
        }
    }
} ]);

