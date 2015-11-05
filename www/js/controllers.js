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
.controller('LoginCtrl', function($scope, $stateParams, $location, LoginService, $ionicLoading, $localstorage, OrgService) {
	console.log('load login');
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
			if (typeof res == 'object' && res.status == 200 && res.data._embedded.items.length == 1) {


				company_data = res.data._embedded.items[0]
				user_url = config.path.baseURL + config.path.users + '?search=user.code:' + $scope.loginData.user_code.trim();
				OrgService.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim(), user_url).then(function (res) {
					console.log(res);
					if (typeof res == 'object' && res.data._embedded.items.length == 1) {

						// STORE in LOCAL
						$localstorage.setObject('user', {
							username : $scope.loginData.company_code.trim(),
							password : $scope.loginData.user_code.trim(),
							company  : company_data,
							user     : res.data._embedded.items[0]
						});

						// GO TO HANDBOOK PAGE
						$location.path('/app/handbooks');
						location.reload();
					}

				}, function (err) {
					$ionicLoading.hide();
					alert('ERROR : Not connect API User, try later!');
				});

			} else if (res && res.status == 401) {
				alert('Wrong Company code or Employee code!');
			} else {
				alert('Wrong Company code or Employee code!');
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
 * HandbooksCtrl : HANDBOOKs PAGE
 */
.controller('HandbooksCtrl',
	function($scope, $rootScope, $location, $stateParams, HandbookService, SectionService, $localstorage, $ionicLoading, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');

	// menu active
    $scope.isActive = function(path) {
        if ($location.path().search(path) >= 0) return true;
        return false;
    };

	// CHECK USER LOGIN
	if (!$scope.user ||  (typeof $scope.user == 'object' && !$scope.user.username)) {
		$location.path('/app/login');
		return;
	}

	if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
		$ionicLoading.show();
		$scope.org = $scope.user.company;

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username, $scope.user.password, $scope.org._links.logo.href + '/url' ).then(function (res) {
				if (typeof res == 'object' && res.status == 200) {
					$scope.org['logo'] = res.data.url;
				}
			}, function (err){
			 	alert('Connect API IMG fail!');
			});
		}

		// GET HANDBOOKs
		HandbookService.get($scope.user.username, $scope.user.password, $scope.org._links.handbooks.href ).then(function (return_data){
			$ionicLoading.hide();
			if (typeof return_data.data != 'object' || !return_data.data._embedded ) {return;}
			$scope.handbooks = return_data.data;

			// GET LANG
			angular.forEach($scope.handbooks._embedded.items, function(item, i) {
			 	HandbookService.get($scope.user.username, $scope.user.password, item._links.translations.href ).then(function (res){
			 		if (typeof res == 'object' && res.status == 200) {
			 			$scope.handbooks._embedded.items[i]['lang'] = res.data;
			 		}
			 	}, function (err){
				 	alert('Connect API Handbooks language fail!');
				 	$ionicLoading.hide();
				});
			});

		}, function (err){
		 	alert('Connect API Handbooks fail!');
		 	$ionicLoading.hide();
		});
	}

})

/**
 * HandbookCtrl : HANDBOOK PAGE
 */
.controller('HandbookCtrl', function($scope, $rootScope, $location, $stateParams, HandbookService, SectionService, $localstorage, $ionicLoading, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.handbook_id = $stateParams.handbook_id

	// menu active
    $scope.isActive = function(path) {
        if ($location.path().search(path) >= 0) return true;
        return false;
    };

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

	if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
		$ionicLoading.show();
		$scope.org = $scope.user.company;

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username, $scope.user.password, $scope.org._links.logo.href + '/url' ).then(function (res) {
				if (typeof res == 'object' && res.status == 200) {
					$scope.org['logo'] = res.data.url;
				}
			}, function (err){
			 	alert('Connect API IMG fail!');
			});
		}

		// GET HANDBOOK
		HandbookService.get($scope.user.username, $scope.user.password, $scope.org._links.handbooks.href + "/" +  $scope.handbook_id).then(function (return_data){
			$scope.handbook = return_data.data;
			$local_handbook = $localstorage.getObject('hdsections_' + $scope.handbook_id);
			$scope.ch_color = '#' + 'cfae79';

			HandbookService.get($scope.user.username, $scope.user.password, $scope.handbook._links.translations.href ).then(function (res){
		 		if (typeof res == 'object' && res.status == 200) {
		 			$scope.handbook['lang'] = res.data;
		 		}
		 	}, function (err){
			 	alert('Connect API Handbooks language fail!');
			 	$ionicLoading.hide();
			});

			if (($local_handbook && $local_handbook.version == $scope.handbook.version)
				|| (typeof $local_handbook == "object" && $local_handbook.version && $local_handbook.version == $scope.handbook.version)) {

				$ionicLoading.hide();
				$scope.sections = $local_handbook.data;
			} else {

				// GET SECTIONS of A HANDBOOK
				SectionService.get($scope.user.username, $scope.user.password, $scope.handbook._links['sections.post'].href).then(function (return_data){
					$ionicLoading.hide();

					angular.forEach(return_data.data._embedded.items, function(item, i) {
						(function(itemInstance) {
							HandbookService.get($scope.user.username, $scope.user.password, itemInstance._links.translations.href ).then(function (res){
						 		if (typeof res == 'object' && res.status == 200) {

						 			return_data.data._embedded.items[i]['lang'] = res.data;
						 			// STORE in LOCAL
						 			$scope.sections = orderSections(return_data.data._embedded.items);
									$localstorage.setObject('hdsections_' + $scope.handbook_id, {
										version : $scope.handbook.version,
										data    : $scope.sections
									});
						 		}
						 	}, function (err){
							 	alert('Connect API Sections language fail!');
							 	$ionicLoading.hide();
							});
						})(item);
					});

					$scope.sections = orderSections(return_data.data._embedded.items);

					// STORE in LOCAL
					$localstorage.setObject('hdsections_' + $scope.handbook_id, {
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

  	$scope.toggleSubGroup = function(group) {
	    if ($scope.isSubGroupShown(group)) {
	    	$scope.shownSubGroup = null;
	    } else {
	      $scope.shownSubGroup = group;
	    }
	};

  	$scope.isSubGroupShown = function(group) {
  		return $scope.shownSubGroup === group;
  	};
  	
})

/**
 * ContactCtrl : CONTACT PAGE
 */
.controller('ContactCtrl',
	function($scope, $rootScope, $location, $stateParams, ContactService, HandbookService, $localstorage, $ionicLoading, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.org 		= $scope.user.company;

	// menu active
    $scope.isActive = function(path) {
        if ($location.path().search(path) >= 0) return true;
        return false;
    };

	if (!$scope.user) {
		$location.path('/app/login');
	} else {
		$ionicLoading.show();

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username, $scope.user.password, $scope.org._links.logo.href + '/url' ).then(function (res) {
				if (typeof res == 'object' && res.status == 200) {
					$scope.org['logo'] = res.data.url;
				}
			}, function (err){
			 	alert('Connect API IMG fail!');
			});
		}

		// GET HANDBOOK
		// HandbookService.get($scope.user.username, $scope.user.password, $scope.org._links.handbooks.href ).then(function (return_data){
		// 	$scope.handbook = return_data.data;
		// 	$local_handbook = $localstorage.getObject('hdsections');

			$scope.ch_color = '#' + 'cfae79';

			ContactService.get($scope.user.username, $scope.user.password, $scope.org._links.positions.href).then(function (contact_res){
				var data = contact_res.data

				if (data._embedded.items.length > 0) {
					$scope.contacts = [];
					angular.forEach(data._embedded.items, function(item, i) {
						ContactService.fetch($scope.user.username, $scope.user.password, item._links.employee.href).then(function (res){
							$scope.contacts.push({
								'position': item,
								'user'    : res.data,
								'alphabet': res.data.first_name.charAt(0).toLowerCase()
							});

							// STORE in LOCAL
							$localstorage.setObject('contacts', {
								"data" : $scope.contacts
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
				} // END IF CONTACTS
			}, function (err){
				$ionicLoading.hide();
			  	alert(err.status + ' : Connect API fail!');
			});

		// 	if (($local_handbook && $local_handbook.version == $scope.handbook.version)
		// 		|| (typeof $local_handbook == "object" && $local_handbook.version && $local_handbook.version == $scope.handbook.version)) {

		// 		$ionicLoading.hide();
		// 		$scope.contacts = $localstorage.getObject('contacts').data;
		// 	} else {

		// 		ContactService.get($scope.user.username, $scope.user.password, $scope.org._links.positions.href).then(function (contact_res){
		// 			var data = contact_res.data

		// 			if (data._embedded.items.length > 0) {
		// 				$scope.contacts = [];
		// 				angular.forEach(data._embedded.items, function(item, i) {
		// 					ContactService.fetch($scope.user.username, $scope.user.password, item._links.employee.href).then(function (res){
		// 						$scope.contacts.push({
		// 							'position': item,
		// 							'user'    : res.data,
		// 							'alphabet': res.data.first_name.charAt(0).toLowerCase()
		// 						});

		// 						// STORE in LOCAL
		// 						$localstorage.setObject('contacts', {
		// 							"data" : $scope.contacts
		// 						});

		// 						if (i==data._embedded.items.length-1) {
		// 							$ionicLoading.hide();
		// 						}

		// 					}, function (err){
		// 						if (i==contact_res.data._embedded.items.length-1) {
		// 							$ionicLoading.hide();
		// 							alert( err.status + ' : Connect API fail!');
		// 						}
		// 					});
		// 				});
		// 			} // END IF CONTACTS

		// 		}, function (err){
		// 			$ionicLoading.hide();
		// 		  	alert(err.status + ' : Connect API fail!');
		// 		});

		// 	}

		// }, function (err){
		//  	alert('Connect API Handbook fail!');
		//  	$ionicLoading.hide();
		// });


	}
})


/**
 * NotificationCtrl : Notification PAGE
 */
.controller('NotificationCtrl',
	function($scope, $rootScope, $location, $stateParams, ContactService, $localstorage, $ionicLoading, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.org 		= $scope.user.company;

	if (!$scope.user) {
		$location.path('/app/login');
	} else {
		$ionicLoading.show();

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username, $scope.user.password, $scope.org._links.logo.href + '/url' ).then(function (res) {
				if (typeof res == 'object' && res.status == 200) {
					$scope.org['logo'] = res.data.url;
				}
			}, function (err){
			 	alert('Connect API IMG fail!');
			});
		}

		// GET Notifis
		OrgService.get($scope.user.username, $scope.user.password, $scope.user.user._links.messages.href).then(function (res) {
			$ionicLoading.hide();
			if (typeof res == 'object' && res.status == 200) {
				$ionicLoading.hide();
			}
		}, function (err){
			$ionicLoading.hide();
		 	alert('Connect API Notifications fail!');
		});
	}
})
;
