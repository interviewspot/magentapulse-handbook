angular.module('starter.services', [])
.factory('UserService', function ($q, $http, $localstorage) {
    var services = {};

    services.get = function (username, password) { 
        console.log(username, password);
        var d = $q.defer();
        $http({
            method: 'GET',
            url: config.path.baseURL + config.path.users,
            headers: {
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
            url: config.path.baseURL + config.path.users + '/' + username,
            headers: {
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
  }
}]);