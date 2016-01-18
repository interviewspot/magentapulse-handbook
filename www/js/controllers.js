/**
 * STARTER APP
 */
angular.module('starter.controllers', [])

/**
 * AppCtrl All site.
 */
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, $ionicPush, $location) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	$scope.isSigned = false;
	$scope.$on('$ionicView.enter', function(e) {
		// CHECK USER
		$scope.user = $localstorage.getObject('user');
		if ($scope.user && $scope.user.username) {
			$scope.isSigned = true;
		} else {
			$scope.isSigned = false;
			$location.path('/app/login');
		}

		// GET SETTINS
		$scope.settings = $localstorage.getObject('settings');
	});
})
/**
 * LoginCtrl
 */
.controller('LoginCtrl', function($scope, $stateParams, $location, $ionicPush, LoginService, $ionicLoading, $localstorage, OrgService) {
	$scope.loginData = {};
	$scope.user = $localstorage.getObject('user');
	$scope.noCompayCode = false;
	$scope.noUserCode   = false;

	//console.log("sss : " + $scope.$$parent.isSigned);

	if ($scope.user &&  (typeof $scope.user == 'object' && $scope.user.username)) {
		$location.path('/app/handbooks');
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

				company_data = res.data._embedded.items[0];
				user_url = config.path.baseURL + config.path.users + '?search=user.code:' + $scope.loginData.user_code.trim();
				OrgService.get($scope.loginData.company_code.trim()
							 , $scope.loginData.user_code.trim()
							 , user_url).then(function (res) {

					// LOGIN OK
					if (typeof res == 'object' && res.data._embedded.items.length == 1) {

						// STORE in LOCAL
						$localstorage.setObject('user', {
							username : $scope.loginData.company_code.trim(),
							password : $scope.loginData.user_code.trim(),
							company  : company_data,
							user     : res.data._embedded.items[0]
						});

						// RESET CACHE


						// GO TO HANDBOOK PAGE
						$location.path('/app/handbooks');
						location.reload();
					}

				}, function (err) {
					$ionicLoading.hide();
					console.log('ERROR : Not connect API User, try later!');
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
		$localstorage.reset();
		$location.path('/app/login');
	});
})

/**
 * HandbooksCtrl : HANDBOOKs PAGE
 */
.controller('HandbooksCtrl',
	function($scope, $rootScope, $location, $stateParams, $ionicPush, HandbookService, SectionService, $localstorage, $ionicLoading, OrgService, ImgService) {
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

	//$scope.org      = $scope.user.company;
	if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
		$ionicLoading.show();
		$scope.org = $scope.user.company;

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , $scope.org._links.logo.href).then(function (res) {

				if (typeof res == 'object' && res.status == 200) {
					//console.log(res.data._links);
					ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , config.path.baseURL + res.data._links.url.href).then(function (res) {

						//console.log(res.data);
						$scope.org['logo'] = res.data.url;
						$scope.user.company['logo'] = res.data.url;

						// STORE in LOCAL
						$localstorage.setObject('user', $scope.user);
					});
				}
			}, function (err){
			 	console.log ('Connect API IMG fail!');
			});
		}

		// GET HANDBOOKs
		if ($scope.org._links.handbooks) {
			$scope.handbooks = $localstorage.getObject('handbooks');

			var ony_active = "?search=handbook.enabled:1";
			HandbookService.get($scope.user.username
							  , $scope.user.password
							  , $scope.user.session_key
							  , $scope.org._links.handbooks.href + ony_active).then(function (return_data){
				$scope.handbooks = [];
				$ionicLoading.hide();
				if (typeof return_data.data != 'object' || !return_data.data._embedded ) {return;}
				$scope.handbooks = return_data.data;

				// GET LANG
				angular.forEach($scope.handbooks._embedded.items, function(item, i) {
				 	HandbookService.get($scope.user.username
				 					  , $scope.user.password
				 					  , $scope.user.session_key
				 					  , item._links.translations.href ).then(function (res){
				 		if (typeof res == 'object' && res.status == 200) {
				 			$scope.handbooks._embedded.items[i]['lang'] = res.data;

				 			// STORE in LOCAL
							$localstorage.setObject('handbooks', $scope.handbooks);
				 		}
				 	}, function (err){
					 	console.log('Connect API Handbooks language fail!');
					 	$ionicLoading.hide();
					});
				});

			}, function (err){
			 	console.log('Connect API Handbooks fail!');
			 	$ionicLoading.hide();
			});
		} else {
			$ionicLoading.hide();
			$scope.handbooks = []; // NO HANDBOOK
		}
	}

})

/**
 * HandbookCtrl : HANDBOOK PAGE
 */
.controller('HandbookCtrl', function($scope, $rootScope, $location, $stateParams, $ionicPush, HandbookService, SectionService, $localstorage, $ionicLoading, OrgService, ImgService) {
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
			ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , $scope.org._links.logo.href).then(function (res) {

				if (typeof res == 'object' && res.status == 200) {
					//console.log(res.data._links);
					ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , config.path.baseURL + res.data._links.url.href).then(function (res) {

						//console.log(res.data);
						$scope.org['logo'] = res.data.url;
						$scope.user.company['logo'] = res.data.url;

						// STORE in LOCAL
						$localstorage.setObject('user', $scope.user);
					});
				}
			}, function (err){
			 	console.log ('Connect API IMG fail!');
			});
		}

		// GET HANDBOOK
		$scope.handbook = $localstorage.getObject('handbook_' + $scope.handbook_id);
		$local_handbook = $localstorage.getObject('hdsections_' + $scope.handbook_id);
		$scope.sections = $local_handbook.data;

		HandbookService.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, $scope.org._links.handbooks.href + "/" +  $scope.handbook_id).then(function (return_data){
			$scope.handbook = return_data.data;
			$scope.ch_color = '#' + 'cfae79';

			HandbookService.get($scope.user.username
							  , $scope.user.password
							  , $scope.user.session_key
							  , $scope.handbook._links.translations.href ).then(function (res){
		 		if (typeof res == 'object' && res.status == 200) {
		 			$scope.handbook['lang'] = res.data;

		 			// STORE in LOCAL
					$localstorage.setObject('handbook_' + $scope.handbook_id, $scope.handbook);
		 		}
		 	}, function (err){
			 	console.log ('Connect API Handbooks language fail!');
			 	$ionicLoading.hide();
			});

			if (($local_handbook && $local_handbook.version == $scope.handbook.version)
				|| (typeof $local_handbook == "object" && $local_handbook.version && $local_handbook.version == $scope.handbook.version)) {

				$ionicLoading.hide();
				$scope.sections = $local_handbook.data;
			} else {

				// GET SECTIONS of A HANDBOOK
				SectionService.get($scope.user.username
								 , $scope.user.password
								 , $scope.user.session_key
								 , $scope.handbook._links.sections.href + "?search=section.parent{null}1&limit=500").then(function (return_data){
					$ionicLoading.hide();

					angular.forEach(return_data.data._embedded.items, function(item, i) {
						(function(itemInstance) {
							HandbookService.get($scope.user.username
											  , $scope.user.password
											  , $scope.user.session_key
											  , itemInstance._links.translations.href ).then(function (res){
						 		if (typeof res == 'object' && res.status == 200) {

						 			return_data.data._embedded.items[i]['lang'] = res.data;
						 			// STORE in LOCAL
						 			$scope.sections = return_data.data._embedded.items;
						 			$scope.sections[i].version = parseInt($scope.sections[i].version);
									$localstorage.setObject('hdsections_' + $scope.handbook_id, {
										version : $scope.handbook.version,
										data    : $scope.sections
									});
						 		}
						 	}, function (err){
							 	console.log('Connect API Sections language fail!');
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
				  console.log('Connect API Sections fail!');
				  $ionicLoading.hide();
				});
			}

		}, function (err){
		 	console.log('Connect API Handbook fail!');
		 	$ionicLoading.hide();
		});
	}


	_findKeyArrayByValue = function($arr, $key, $val) {
		re_val = null;
		angular.forEach($arr, function(item, i) {
			//console.log(item + " " + $val );
			if (item[$key] == $val) {
				re_val = i;
				return;
			}
		});
		return re_val;
	};

	_loadChildSection = function($section) {
		//console.log($section.children._embedded);
		if ($section.children._embedded) {return;}
		//console.log($section.children._embedded);
		if ($section._links.children) {
			//console.log($section.id);
			var j = _findKeyArrayByValue($scope.sections, 'id', $section.id);
			$ionicLoading.show();
			HandbookService.get($scope.user.username
				  , $scope.user.password
				  , $scope.user.session_key
				  , $section._links.children.href ).then(function (res){
				$ionicLoading.hide();
				$scope.sections[j].children = res.data;

				angular.forEach(res.data._embedded.items, function(item, i) {
						(function(itemInstance) {
							HandbookService.get($scope.user.username
											  , $scope.user.password
											  , $scope.user.session_key
											  , itemInstance._links.translations.href ).then(function (res){
						 		if (typeof res == 'object' && res.status == 200) {

						 			//res.data._embedded.items[i]['lang'] = res.data;
						 			// STORE in LOCAL
						 			$scope.sections[j].children._embedded.items[i]['lang'] = res.data;
						 			$scope.sections[j].children._embedded.items[i].version = parseInt($scope.sections[j].children._embedded.items[i].version);
									$localstorage.setObject('hdsections_' + $scope.handbook_id, {
										version : $scope.handbook.version,
										data    : $scope.sections
									});
						 		}
						 	}, function (err){
							 	console.log('Connect API Sections language fail!');
							 	$ionicLoading.hide();
							});
						})(item);
					});
			}, function (err){
			 	console.log('Connect API Sections language fail!');
			 	$ionicLoading.hide();
			});

		}
	};

	$scope.toggleGroup = function(group) {
		//console.log(group);
	    if ($scope.isGroupShown(group)) {
	    	$scope.shownGroup = null;
	    } else {
	     	$scope.shownGroup = group;
	     	// LOAD MOVE CHILD
	     	_loadChildSection(group);
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
	function($scope, $rootScope, $location, $stateParams, ContactService, $ionicPush, HandbookService, $localstorage, $ionicLoading, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.org 		= $scope.user.company;


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

	if (!$scope.user) {
		$location.path('/app/login');
	} else {
		$ionicLoading.show();
		$scope.contacts = $localstorage.getObject('contacts').data;


		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , $scope.org._links.logo.href).then(function (res) {

				if (typeof res == 'object' && res.status == 200) {
					//console.log(res.data._links);
					ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , config.path.baseURL + res.data._links.url.href).then(function (res) {

						//console.log(res.data);
						$scope.org['logo'] = res.data.url;
						$scope.user.company['logo'] = res.data.url;

						// STORE in LOCAL
						$localstorage.setObject('user', $scope.user);
					});
				}
			}, function (err){
			 	console.log ('Connect API IMG fail!');
			});
		}

		if ($scope.contacts) {
			$ionicLoading.hide();
			return;
		}
		// GET CONTACT
		$scope.ch_color = '#' + 'cfae79';
		ContactService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , $scope.org._links.positions.href + "?search=position.handbookContact:1,position.enabled:1").then(function (contact_res){

			var data = contact_res.data

			if (data._embedded.items.length > 0) {
				$scope.contacts = [];
				angular.forEach(data._embedded.items, function(item, i) {
					$scope.contacts[i] = {};
					ContactService.fetch($scope.user.username
									   , $scope.user.password
									   , $scope.user.session_key
									   , item._links.employee.href).then(function (res){
						$scope.contacts[i]['position'] = item;
						$scope.contacts[i]['user']	   = res.data;
						$scope.contacts[i]['alphabet'] = res.data.first_name.charAt(0).toLowerCase()

						// STORE in LOCAL
						$localstorage.setObject('contacts', {
							"data" : $scope.contacts
						});


						// GET TAGS
						if (item._links.tags) {
							ContactService.fetch($scope.user.username
										   , $scope.user.password
										   , $scope.user.session_key
										   , item._links.tags.href).then(function (res){
	                            $scope.contacts[i]['tags'] = res.data
								// STORE in LOCAL
								$localstorage.setObject('contacts', {
									"data" : $scope.contacts
								});
							});
						}

                        console.log($scope.contacts);
						if (i==data._embedded.items.length-1) {
							$ionicLoading.hide();
						}

					}, function (err){
						if (i==contact_res.data._embedded.items.length-1) {
							$ionicLoading.hide();
							console.log( err.status + ' : Connect API fail!');
						}
					});
				});
			} // END IF CONTACTS
		}, function (err){
			$ionicLoading.hide();
		  	console.log(err.status + ' : Connect API fail!');
		});
	}
})


/**
 * NotificationCtrl : Notification PAGE
 */
.controller('NotificationCtrl',
	function($scope, $rootScope, $location, $stateParams, ContactService, $localstorage, $ionicLoading, $ionicPush, OrgService, ImgService) {
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.org 		= $scope.user.company;
	$scope.notifis  = [];


	if (!$scope.user) {
		$location.path('/app/login');
	} else {
		$ionicLoading.show();

		// GET IMG
		if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
			ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , $scope.org._links.logo.href).then(function (res) {

				if (typeof res == 'object' && res.status == 200) {
					//console.log(res.data._links);
					ImgService.get($scope.user.username
						 , $scope.user.password
						 , $scope.user.session_key
						 , config.path.baseURL + res.data._links.url.href).then(function (res) {

						//console.log(res.data);
						$scope.org['logo'] = res.data.url;
						$scope.user.company['logo'] = res.data.url;

						// STORE in LOCAL
						$localstorage.setObject('user', $scope.user);
					});
				}
			}, function (err){
			 	console.log ('Connect API IMG fail!');
			});
		}

		// GET Notifis
		var_filter = "?sort=message.createdAt:desc"
		OrgService.get($scope.user.username
					 , $scope.user.password
					 , $scope.user.user._links.messages.href + var_filter).then(function (res) {
			$ionicLoading.hide();
			if (typeof res == 'object' && res.status == 200) {
				$ionicLoading.hide();
				$scope.notifis = res.data
			}
		}, function (err){
			$ionicLoading.hide();
		 	console.log('Connect API Notifications fail!');
		});

		// READ IT
		$scope.readIt = function (notifi) {

			if (notifi.read == true) {return;}
			notifi.read = true;
			console.log(notifi);
			return;
			var link        = notifi._links.self.href;
			var send_data = {
				message : {
					"read" : true,
					"sender": $scope.org.id,
    				"recipient": $scope.org.id
				}
			};
			console.log(send_data);

			OrgService.update($scope.user.username
					 , $scope.user.password
					 , link
					 , send_data ).then(function (res) {
				if (typeof res == 'object' && res.status == 204) {
					console.log('Ok');
				}
			}, function (err){
				console.log('Error');
			});
		}
	}
})

/**
 * NotificationCtrl : Notification PAGE
 */
.controller('SettingsCtrl',
	function($scope, $rootScope, $location, $stateParams, $localstorage, $ionicLoading, $ionicPush) {

	$scope.settings = $localstorage.getObject('settings');
	if (!$scope.settings || $scope.settings == undefined) {
		$scope.settings = {
			"fontsize" : "fz-14"
		};
	}

	$scope.$watch(
		"settings.fontsize",
		function handleFooChange( nv, ov ) {
	    	// STORE in LOCAL
	    	if (nv && nv != undefined) {
	    		$localstorage.setObject('settings', $scope.settings);
	    	}
		}
	);

})
;
