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
                    $tab_content    =   $this_parent.siblings('.store-desc');

                if(!$this.hasClass('active')) {
                    $this.addClass('active');
                    $this.closest('li').siblings('li').find('.active').removeClass('active');
                    $tab_content.siblings('.store-desc').removeClass('active');
                    $('#' + data_link).addClass('active');
                }

            });
        }
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
