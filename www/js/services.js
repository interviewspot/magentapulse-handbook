angular.module('starter.services', [])

.factory('aRest', function ($q, $http, $localstorage) {
    var services = {};

    services.get = function (username, password, session, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            // url: config.path.baseURL + config.path.users,
            url: url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password,
                //'x-session' : session
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;  
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    };

    services.update = function (username, password, url, data) {
        var d = $q.defer();
        $http({
            method: 'PUT',
            url: url,
            data: data,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    };

    services.post = function (username, password, url, data) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: url,
            data: data,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    };
    return services;
})

.factory('OrgService', function ($q, $http, $localstorage) {
    var services = {};
    services.get = function (username, password, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    }

    services.update = function (username, password, url, data) {
        var d = $q.defer();
        $http({
            method: 'PUT',
            url: url,
            data: data,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    }

    return services;
})

.factory('LoginService', function ($q, $http) {
    var services = {};
    services.get = function (username, password) { 
        var d = $q.defer();
        $http({
            method: 'GET',
            url: config.path.baseURL + '/organisations?search=organisation.code:' + username.trim(),
            headers: {
                "x-username": username.trim(),
                "x-mode"    : "org_code",
                "x-password": password.trim()
            }
        })
        .then(function success(res){
            d.resolve(res);
            return;  
        }, function error(error) {
            d.reject(error);
            return;
        });
        return d.promise;
    }
    return services;
})

// .factory('LocationSettings', ['$q', 'Diagnostic', function($q, Diagnostic) {
//   return {
//     getLocationSettings: function(options) {
//       var q = $q.defer();
//       Diagnostic.isLocationEnabled(function(result) {
//         console.log("Location is " + (result ? "enabled" : "disabled"));
//         q.resolve(result);
//       }, function(err) {
//         console.error("The following error occurred: "+err);
//         q.reject(err);
//       }, options);

//       return q.promise;
//     }
//   }
// }])

// directive show tab
.directive('outlettab', [function () {
    return {
        restrict: 'EA',
        link: function (scope, ele, attrs) {
            $(ele).on('click', function (e) {
                var $this           =   $(this),
                    data_link       =   $this.data('link'),
                    $this_parent    =   $this.closest('.menu-pagi'),
                    $tab_content    =   $this_parent.siblings('.store-desc'),
                    $map            =   $tab_content.find('.blk-maps-outlet');

                if(!$this.hasClass('active')) {
                    $this.addClass('active');
                    $this.closest('li').siblings('li').find('.active').removeClass('active');
                    $tab_content.siblings('.store-desc').removeClass('active');
                    $('#' + data_link).addClass('active');

                    // maps init
                    if(data_link == 'location-tab') {
                        $location = $map.data('location');
                        var myLatlng = new google.maps.LatLng($location.geo_location.geo_lat, $location.geo_location.geo_lng);

                        var mapOptions = {
                          center: myLatlng,
                          zoom: 14,
                          mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        var map = new google.maps.Map(document.getElementById("map-outlet"),
                            mapOptions);

                        //Marker + infowindow + angularjs compiled ng-click
                        var marker = new google.maps.Marker({
                          position: myLatlng,
                          map: map,
                        });

                        var contentString = "<div class='pop-outlet'>"
                              +   "<figure><img src='"+ $location.logo +"'/></figure>"
                              +   "<div class='out-info'><h3>"+ $location.name +"</h3>"
                              +       "<p>"+ $location.outlet_address +"</p>"
                              +   "</div>"
                              + "</div>";

                        var infowindow;
                        infowindow = null;

                        google.maps.event.addListener(marker, 'click', function() {
                            if(infowindow) {
                                infowindow.close();
                                infowindow = null;
                                return;
                            }
                            infowindow = new google.maps.InfoWindow({
                              content: contentString
                            });
                            infowindow.open(map, marker);
                        });
                    }
                }

            });
        }
    };
}])

// directive banner slider
.directive('mainslider', ['$timeout',
    function ($timeout) {
    sliderLink = function (scope, ele, attrs) {

        scope.$on('dataloaded', function () {
            $timeout(function () {
                $(ele).flexslider({
                    animation: "fade",
                    // Primary Controls
                    controlNav: false,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
                    directionNav: false,             //Boolean: Create navigation for previous/next navigation? (true/false)
                    prevText: "",           //String: Set the text for the "previous" directionNav item
                    nextText: "",
                    slideshowSpeed: 4000,
                    pauseOnHover: false
                });
            });
        }, 0, false);


    };
    sliderCtrl = [
        '$scope', '$http',
        function($scope, $http) {

          $scope.$watch('data', function(nv) {
            if (nv) {
              return $scope.detail_outlet == nv;
            }
          });
        }
    ];
    return {
        restrict: 'EA',
        scope   : {
            data   : '='
        },
        templateUrl : 'templates/directives/mainslider.html',
        controller : sliderCtrl,
        link: sliderLink
    };
}])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}]);
