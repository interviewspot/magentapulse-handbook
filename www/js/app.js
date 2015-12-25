// Ionic Starter App
var config = {
  path : {
      'baseURL'               : 'https://api.sg-benefits.com',
  }
};
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic','ionic.service.core',
  'ngResource',
  'starter.controllers', 
  'starter.services',
  'angular.filter',
  'ngCordova',
  'ionic.service.push'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


    // // NOTIFICATION
    // var io = Ionic.io();
    // var push = new Ionic.Push({
    //   "onNotification": function(notification) {
    //     alert('Received push notification!');
    //   },
    //   "pluginConfig": {
    //     "android": {
    //       "iconColor": "#0000FF"
    //     }
    //   }
    // });
    // var user = Ionic.User.current();

    // if (!user.id) {
    //   user.id = Ionic.User.anonymousId();
    // }

    // // Just add some dummy data..
    // user.set('name', 'sgbenefit');
    // user.set('bio', 'bio_1');
    // user.save();

    // var callback = function(data) {
    //   push.addTokenToUser(user);
    //   user.save();
    //   console.log(data);
    // };
    // push.register(callback);
  });

})

.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider, $httpProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })
  .state('app.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
      }
    }
  })
  .state('app.myoffer', {
    url: '/myoffer',
    views: {
      'menuContent' : {
        templateUrl : 'templates/myOffer.html',
        controller: 'myOfferCtrl'
      }
    }
  })
  .state('app.fb', {
    url: '/fb',
    views: {
      'menuContent' : {
        templateUrl : 'templates/fb.html',
        controller: 'fbCtrl'
      }
    }
  })
  .state('app.health', {
    url: '/health',
    views: {
      'menuContent' : {
        templateUrl : 'templates/health.html',
        controller: 'healthCtrl'
      }
    }
  })
  .state('app.kid', {
    url: '/kids',
    views: {
      'menuContent' : {
        templateUrl : 'templates/kid.html',
        controller: 'kidCtrl'
      }
    }
  })
  .state('app.location', {
    url : '/location',
    views: {
      'menuContent' : {
        templateUrl: 'templates/location.html',
        controller : 'locationCtrl'
      }
    }
  })
  .state('app.store-detail', {
    url : '/store-detail',
    views: {
      'menuContent' : {
        templateUrl: 'templates/store-detail.html',
        controller : 'storeDetailCtrl'
      }
    }
  })
  .state('app.main-course', {
    url : '/main-course',
    views: {
      'menuContent' : {
        templateUrl: 'templates/main-course.html',
        controller : 'courseCtrl'
      }
    }
  })
  .state('app.menu-demo', {
    url : '/menu-demo',
    views: {
      'menuContent' : {
        templateUrl: 'templates/menu-demo.html',
        controller : 'menuDemoCtrl'
      }
    }
  })
  
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
  $sceDelegateProvider.resourceUrlWhitelist(['self',
      'https://api.sg-benefits.com/**',
      'http://maps.google.com/**']);
  $httpProvider.defaults.headers.common = {
    "Content-Type": "application/json",
    "Accept": "application/hal+json, application/json, */*; q=0.01"
    // 'x-username': 'kenneth.yap@ap.magenta-consulting.com',
    // 'x-password': 'p@ssword'
  };
})
.config(['$ionicAppProvider', function($ionicAppProvider) {
  $ionicAppProvider.identify({
      app_id: '4c177bdb',
      api_key: 'AIzaSyBds2WK_6GH859BWD-nsBAHI2RH27Jrf6c',
      dev_push: true
  });
}]);

// android map api key: AIzaSyAJZR93qIV721hsq6vwcXokliidN0WnZu8
// ios mapp api key: AIzaSyBe47muzhtMCpOpyUXJxblAPCw-G8MZlZo [com.magentapulse.sgbenefit]
// AIzaSyDtGb40BoqhmWh_YCCge9pSbXEf-8tiqpU
// cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="AIzaSyAJZR93qIV721hsq6vwcXokliidN0WnZu8" --variable API_KEY_FOR_IOS="AIzaSyBe47muzhtMCpOpyUXJxblAPCw-G8MZlZo"
// Project ID: 4c177bdb
// project number GCM: 918288733027
// api key AIzaSyBds2WK_6GH859BWD-nsBAHI2RH27Jrf6c
// token-device : DEV-66ea042d-bb88-420b-a495-8d23e3efc826
// curl -u AIzaSyBds2WK_6GH859BWD-nsBAHI2RH27Jrf6c: -H "Content-Type: application/json" -H "X-Ionic-Application-Id: 4c177bdb" https://push.ionic.io/api/v1/push -d '{"tokens":["DEV-66ea042d-bb88-420b-a495-8d23e3efc826"],"notification":{"alert":"I come from planet Ion."}}'
