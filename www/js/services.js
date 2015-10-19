angular.module('starter.services', [])
.factory('ContactService', function ($q, $http, $localstorage) {
    var services = {};

    services.get = function (username, password) { 
        var d = $q.defer();
        $http({
            method: 'GET',
            // url: config.path.baseURL + config.path.users,
            url:  config.path.baseURL + '/organisations/2/positions',
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
    services.fetch = function(username, password, url) {
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

    return services;
})
.factory('HandbookService', function ($q, $http, $localstorage) {
    var services = {};

    services.get = function (username, password) { 
        var d = $q.defer();
        $http({
            method: 'GET',
            // url: config.path.baseURL + config.path.users,
            url: 'https://api.sg-benefits.com/organisations/2/handbooks/1',
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
.factory('SectionService', function ($q, $http, $localstorage) {
    var services = {};
    services.get = function (username, password) { 
        var d = $q.defer();
        $http({
            method: 'GET',
            url: 'https://api.sg-benefits.com/organisations/2/handbooks/1/sections',
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

    return services;
})
.factory('ImgService', function ($q, $http, $localstorage) {
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

    return services;
})
.factory('LoginService', function ($q, $http) {
    var services = {};
    services.get = function (username, password) { 
        var d = $q.defer();
        $http({
            method: 'GET',
            url: config.path.baseURL + '/organisations/' + '2',
            headers: {
                "x-username": username,
                "x-mode"    : "org_code",
                "x-password": password
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
