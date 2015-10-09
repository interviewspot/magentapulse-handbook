angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('LoginCtrl', function($scope, $state, $stateParams, $location, LoginService, $http) {
  $scope.loginData = {};
  $scope.doLogin = function() {
    var login = LoginService.login($scope.loginData.username, $scope.loginData.password);
    login.get({}, function (data, getResponseHeaders){
      console.log(data);
      if (data) 
        $state.go('app.contacts');
        // $location.path('/app/contacts');
    });
    
  };
})
.controller('ContactCtrl', function($scope, $stateParams, UserService) {
  UserService.query({}, function (data, getResponseHeaders){
   // console.log(data);
   $scope.contacts = data._embedded.items;
  });
})
.controller('ContactDetailCtrl', function($scope, $stateParams, UserService) {
  console.log($stateParams.contactId);
});
