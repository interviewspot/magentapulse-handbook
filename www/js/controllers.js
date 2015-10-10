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
				$location.path('/app/handbook');
			}
		}, function (err){
			if (err) {
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
		$location.path('/app/login');
	});
})
.controller('HandbookCtrl', function($scope, $rootScope, $location, $stateParams, HandbookService, SectionService, $localstorage, $ionicLoading) {
	var sectionCompare = function (a,b) {
		if (a.version < b.version)
      return -1;
    if (a.version > b.version)
      return 1;
    return 0;
	}
	var orderSections = function(items) {
		var newList = [];
		angular.forEach(items, function(item, i) {
			if (!item._links.parent) {
				item.children = [];
        newList.push(item);
			}            
		});
		
		angular.forEach(items, function(item, i) {
			if (item._links.parent) {
				angular.forEach(newList, function(item2, j) {
					if (newList[j]._links.self.href == item._links.parent.href) {
						newList[j].children.push(item);
					}
				});
			}          
		});
		angular.forEach(newList, function(item, j) {
			newList[j].children = newList[j].children.sort(sectionCompare); 
		});
		newList.sort(sectionCompare);
		return newList;
	}
            
	$scope.user = $localstorage.getObject('user');
	if (!$scope.user) {
		$location.path('/app/login');
	} else {
		$ionicLoading.show();
		HandbookService.get($scope.user.username, $scope.user.password).then(function (return_data){
			$scope.handbook = return_data.data;
			SectionService.get($scope.user.username, $scope.user.password).then(function (return_data){
				$ionicLoading.hide();

				$scope.sections = orderSections(return_data.data._embedded.items);
				console.log($scope.sections);
			}, function (err){
			  alert('Connect API fail!');
			});
		}, function (err){
		  alert('Connect API fail!');
		});
	}
	$scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
  	return $scope.shownGroup === group;
  };
})
.controller('ContactCtrl', function($scope, $rootScope, $location, $stateParams, ContactService, $localstorage, $ionicLoading) {
		$scope.user = $localstorage.getObject('user');
		if (!$scope.user) {
			$location.path('/app/login');
		} else {
			$ionicLoading.show();
			ContactService.get($scope.user.username, $scope.user.password).then(function (contact_res){
				var data = contact_res.data
				if (data._embedded.items.length > 0) {
					$scope.contacts = [];
					angular.forEach(data._embedded.items, function(item, i) {
						ContactService.fetch($scope.user.username, $scope.user.password, item._links.employee.href).then(function (res){
							$scope.contacts.push({
									'position': item,
									'user' : res.data,
									'alphabet' : res.data.email.charAt(0).toLowerCase()
							});
							if (i==data._embedded.items.length-1) {
								$ionicLoading.hide();
							}
						}, function (err){
							if (i==contact_res.data._embedded.items.length-1) {
								$ionicLoading.hide();
								alert('Connect API fail!');
							}
						});
					});
				}
			}, function (err){
			  alert('Connect API fail!');
			});
		}
})
.controller('ContactDetailCtrl', function($scope, $stateParams, UserService) {
	console.log($stateParams.contactId);
});
