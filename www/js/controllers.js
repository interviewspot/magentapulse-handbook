/**
 * STARTER APP
 */
angular.module('starter.controllers', [])

/**
 * AppCtrl All site.
 */
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
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
/**
 * LoginCtrl
 */
.controller('LoginCtrl', function($scope, $stateParams, $location, LoginService, $ionicLoading, $localstorage) {
	$scope.loginData = {};
	$scope.user = $localstorage.getObject('user');
	$scope.noCompayCode = false;
	$scope.noUserCode   = false;

	if ($scope.user &&  (typeof $scope.user == 'object' && $scope.user.username)) {
		$location.path('/app/handbook');
	}
	$scope.doLogin = function() {
		// var login = LoginService.login($scope.loginData.company_code, $scope.loginData.password);
		// VALIDATE FRM
		var isValid = true;
		if (!$scope.loginData.company_code || $scope.loginData.company_code.length <= 3) {
			$scope.noCompayCode = true;
			isValid = false;
		} else {
			$scope.noCompayCode = false;
			isValid = true;
		}

		if (!$scope.loginData.user_code || $scope.loginData.user_code.length <= 3) {
			$scope.noUserCode = true;
			isValid = false;
		} else {
			$scope.noCompayCode = false;
			isValid = true;
		}

		if (!isValid) {	return isValid; }

		$scope.noCompayCode = false;
		$scope.noUserCode   = false;

		$ionicLoading.show();
		LoginService.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim()).then(function (res){
			$ionicLoading.hide();
			if (res && res.status == 200) {

				// STORE in LOCAL
				$localstorage.setObject('user', {
					username: $scope.loginData.company_code.trim(),
					password: $scope.loginData.user_code.trim()
				});

				// GO TO HANDBOOK PAGE
				$location.path('/app/handbook');
				// location.href = '#/app/handbook';
			} else if (res && res.status == 401) {
				alert('Wrong Company code or Employee code!');
			} else {
				alert('ERROR ' + res.status);
			}
		}, function (err){
			$ionicLoading.hide();
			if (err.data) {
				alert('ERROR ' + err.data.message);
			} else {
				alert('ERROR : Not connect API, try later!');
			}
		});
	};
})
/**
 * LogoutCtrl
 */
.controller('LogoutCtrl', function($scope, $stateParams, $localstorage, $location) {
	$scope.$on('$ionicView.enter', function(e) {
		$scope.user = null;
		$localstorage.setObject('user', null);
		$location.path('/app/login');
	});
})
/**
 * HandbookCtrl : HANDBOOK PAGE
 */
.controller('HandbookCtrl', function($scope, $rootScope, $location, $stateParams, HandbookService, SectionService, $localstorage, $ionicLoading) {
	$scope.cur_path = $location.path();
	$scope.user = $localstorage.getObject('user');
	if (!$scope.user ||  (typeof $scope.user == 'object' && !$scope.user.username)) {
		$location.path('/app/login');
		return;
	}

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
            
	console.log($scope.user);
	if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
		$ionicLoading.show();
		HandbookService.get($scope.user.username, $scope.user.password).then(function (return_data){
			$scope.handbook = return_data.data;

			$local_handbook = $localstorage.getObject('hdsections');
			// console.log($local_handbook.version + ' = ' + $scope.handbook.version);

			if (($local_handbook && $local_handbook.version == $scope.handbook.version)
				|| (typeof $local_handbook == "object" && $local_handbook.version && $local_handbook.version == $scope.handbook.version)) {

				$ionicLoading.hide();
				$scope.sections = $local_handbook.data;
			} else {

				// GET SECTIONS
				SectionService.get($scope.user.username, $scope.user.password).then(function (return_data){
					$ionicLoading.hide();
					$scope.sections = orderSections(return_data.data._embedded.items);

					// STORE in LOCAL
					$localstorage.setObject('hdsections', {
						version : $scope.handbook.version,
						data    : $scope.sections
					});

				}, function (err){
				  alert('Connect API Sections fail!');
				  $ionicLoading.hide();
				});
			}

		}, function (err){
		 	alert('Connect API Handbook fail!');
		 	$ionicLoading.hide();
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

/**
 * ContactCtrl : CONTACT PAGE
 */
.controller('ContactCtrl', function($scope, $rootScope, $location, $stateParams, ContactService, $localstorage, $ionicLoading) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	console.log($scope.user);
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
							alert( err.status + ' : Connect API fail!');
						}
					});
				});
			}
		}, function (err){
			$ionicLoading.hide();
		  	alert(err.status + ' : Connect API fail!');
		});
	}
})
