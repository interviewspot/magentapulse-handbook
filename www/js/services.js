angular.module('starter.services', [])
.factory('ContactService', function ($q, $http, $localstorage) {
    var services = {};

    services.get = function (username, password, session, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            // url: config.path.baseURL + config.path.users,
            url:  url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password,
                'x-session' : session
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
    services.fetch = function(username, password, session, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password,
                'x-session' : session
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
                'x-session' : session
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
    services.get = function (username, password, session, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password,
                'x-session' : session
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
.factory('ImgService', function ($q, $http, $localstorage) {
    var services = {};
    services.get = function (username, password, session, url) {
        var d = $q.defer();
        $http({
            method: 'GET',
            url: url,
            headers: {
                "x-mode"    : "org_code",
                'x-username': username,
                'x-password': password,
                'x-session' : session
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
        },
        reset: function () {
            $window.localStorage.clear();
        }
    }
}])
.factory('$tool_fn', [function() {
    return {
        _getKeybyId : function (obj, id) {
            var return_val = 0;
            angular.forEach(obj, function(value, key) {
                if (value.id == id) {
                    return_val = key;
                    return;
                }
            });
            return return_val;
        },
        _checkHandbookChange : function (newData, oldData) {
            if (oldData.total === undefined) {
                return true;
            }
            if (newData._embedded.items) {
                if (newData._embedded.items.length != oldData._embedded.items.length) {
                    return true;
                }

                result = false;
                angular.forEach(newData._embedded.items, function(item, i) {

                    if (item.version != oldData._embedded.items[i].version) {
                        result = true;
                    }
                });
                return result;
            } else {
                return true;
            }
            return false;
        },
        explode: function(delimiter, string, limit) {
          var s;
          if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') {
            return null;
          }
          if (delimiter === '' || delimiter === false || delimiter === null) {
            return false;
          }
          if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object') {
            return {
              0: ''
            };
          }
          if (delimiter === true) {
            delimiter = '1';
          }
          delimiter += '';
          string += '';
          s = string.split(delimiter);
          if (typeof limit === 'undefined') {
            return s;
          }
          if (limit === 0) {
            limit = 1;
          }
          if (limit > 0) {
            if (limit >= s.length) {
              return s;
            }
            return s.slice(0, limit - 1).concat([s.slice(limit - 1).join(delimiter)]);
          }
          if (-limit >= s.length) {
            return [];
          }
          s.splice(s.length + limit);
          return s;
        },
        randomString: function(length, chars) {
          var i, mask, result, _i;
          mask = '';
          if (chars.indexOf('a') > -1) {
            mask += 'abcdefghijklmnopqrstuvwxyz';
          }
          if (chars.indexOf('A') > -1) {
            mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          }
          if (chars.indexOf('#') > -1) {
            mask += '0123456789';
          }
          if (chars.indexOf('!') > -1) {
            mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
          }
          result = '';
          for (i = _i = length; length <= 0 ? _i <= 0 : _i >= 0; i = length <= 0 ? ++_i : --_i) {
            result += mask[Math.round(Math.random() * (mask.length - 1))];
          }
          return result;
        },
        getNOW_TimeStamp: function() {
          var now;
          now = new Date;
          return now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + ':' + (now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds());
        },
        getTimeStamp: function(ndate) {
          var dateAsDateObject;
          if (ndate === 1) {
            ndate = getNOW_TimeStamp();
          }
          dateAsDateObject = new Date(Date.parse(ndate));
          return dateAsDateObject.getTime();
        },
        _findKeyArrayByValue : function($arr, $key, $val) {
            re_val = null;
            angular.forEach($arr, function(item, i) {
                //console.log(item + " " + $val );
                if (item[$key] == $val) {
                    re_val = i;
                    return;
                }
            });
            return re_val;
        }
    };
}])
;
