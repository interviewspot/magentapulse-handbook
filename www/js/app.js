// Ionic Starter App
config = {
  path : {
      'baseURL'               : 'https://api.sg-benefits.com',
      'clients'               : '/organisations',
      'client'                : '/organisations/:org_id',
      'handbooks'             : '/organisations/:org_id/handbooks',
      'handbook'              : '/organisations/:org_id/handbooks/:hand_id',
      'sections'              : '/organisations/:org_id/handbooks/:hand_id/sections',
      'section'               : '/organisations/:org_id/handbooks/:hand_id/sections/:section_id',
      'section_children'      : '/organisations/:org_id/handbooks/:hand_id/sections/:section_id/children',
      'section_parent'        : '/organisations/:org_id/handbooks/:hand_id/sections/parent',
      'contacts'              : '/organisations/:org_id/positions',
      'contact'               : '/organisations/:org_id/positions/:position_id',
      'users'                 : '/users',
      'user'                 : '/users/:email',
  }
};
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic', 
  'ngResource',
  'starter.controllers', 
  'starter.services',
  'angular.filter'
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
  .state('app.handbook', {
    url: '/handbook',
    views: {
      'menuContent': {
        templateUrl: 'templates/handbook.html',
        controller: 'HandbookCtrl'
      }
    }
  })
  .state('app.contacts', {
    url: '/contacts',
    views: {
      'menuContent': {
        templateUrl: 'templates/contacts.html',
        controller: 'ContactCtrl'
      }
    }
  })
  .state('app.contact', {
    url: '/contacts/:contactId',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html',
        controller: 'ContactDetailCtrl'
      }
    }
  })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
  $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://api.sg-benefits.com/**']);
  // $httpProvider.defaults.headers.common = {
  //   'x-username': 'kenneth.yap@ap.magenta-consulting.com',
  //   'x-password': 'p@ssword'
  // }
});
