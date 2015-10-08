angular.module('starter.services', [])
.factory('UserService', function ($resource) {
    var service = $resource(config.path.baseURL + config.path.users, {}, {
            query: {
                method:"GET"
            },
            login: {
            	method:"GET",
            	action: config.path.baseURL + config.path.user
            }
        }
    )
    return service;
})
.factory('LoginService', function ($resource) {
    var services = {};
    services.login = function(username, password) {
        return $resource(config.path.baseURL + config.path.users, {}, {
                get: {
                    method:"GET",
                    action: config.path.baseURL + config.path.users + '/' + username,
                    headers: {
                        'x-username': username,
                        'x-password': password
                    }
                }
            }
        )
    }
    return services;
});