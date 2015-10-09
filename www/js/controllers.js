angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.isSigned = false;
  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localstorage.getObject('user');
    if ($scope.user && $scope.user.username) {
      $scope.isSigned = true;
    } else {
      $scope.isSigned = false;
    }
  });
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
.controller('LoginCtrl', function($scope, $stateParams, $location, LoginService, $ionicLoading, $localstorage) {
  $scope.loginData = {};
  $scope.doLogin = function() {
    // var login = LoginService.login($scope.loginData.username, $scope.loginData.password);
    $ionicLoading.show();
    LoginService.get($scope.loginData.username, $scope.loginData.password).then(function (res){
      if (res && res.status == 200 && res.data.email == $scope.loginData.username) {

        $localstorage.setObject('user', {
          username: $scope.loginData.username,
          password: $scope.loginData.password
        });
        $ionicLoading.hide();
        $location.path('/app/contacts');
      }
    }, function (err){
      if (err && err.status == 401 ) {
        $ionicLoading.hide();
        alert(err.data.message);
      }
    })
    
  };
})
.controller('LogoutCtrl', function($scope, $stateParams, $localstorage, $location) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = null;
    $localstorage.setObject('user', null);
    console.log($scope.isSigned);
    $location.path('/app/login');
  });
})
.controller('ContactCtrl', function($scope, $rootScope, $location, $stateParams, UserService, $localstorage, $ionicLoading) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.user = $localstorage.getObject('user');
    if (!$scope.user) {
      $location.path('/app/login');
    } else {
      $ionicLoading.show();
      UserService.get($scope.user.username, $scope.user.password).then(function (res){
        $scope.contacts = res.data._embedded.items;
        angular.forEach($scope.contacts, function(contact, key) {
          $scope.contacts[key]['name'] = contact.first_name + ' ' + contact.last_name
        });
        $ionicLoading.hide();
      }, function (err){
        $ionicLoading.hide();
        alert('Connect API fail!');
      });
    }
  });
})
.controller('ContactDetailCtrl', function($scope, $stateParams, UserService) {
  console.log($stateParams.contactId);
});
