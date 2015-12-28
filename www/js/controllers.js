/**
 * STARTER APP
 */
angular.module('starter.controllers', [])

/**
 * AppCtrl All site.
 */
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, $ionicPush) {
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
.controller('LoginCtrl', function($scope, $stateParams, $location, $ionicPush, LoginService, $ionicLoading, $localstorage, OrgService) {
	console.log('load login');
	$scope.loginData = {};
	$scope.user = $localstorage.getObject('user');
	$scope.noCompayCode = false;
	$scope.noUserCode   = false;

	if ($scope.user &&  (typeof $scope.user == 'object' && $scope.user.username)) {
		$location.path('/app/myoffer');
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
				OrgService.get($scope.loginData.company_code.trim()
							 , $scope.loginData.user_code.trim()
							 , user_url).then(function (res) {

					if (typeof res == 'object' && res.data._embedded.items.length == 1) {

						// STORE in LOCAL
						$localstorage.setObject('user', {
							username : $scope.loginData.company_code.trim(),
							password : $scope.loginData.user_code.trim(),
							company  : company_data,
							user     : res.data._embedded.items[0]
						});

						// GO TO HANDBOOK PAGE
						$location.path('/app/myoffer');
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
		$localstorage.setObject('user', null);
		$location.path('/app/login');
	});
})
/**
 * myOfferCtrl
 */
.controller('myOfferCtrl',
	function ($scope, $rootScope, $location, $stateParams,  $ionicPush, ClientsService, $localstorage, $ionicLoading, OrgService, ImgService) {
		$scope.cur_path = $location.path();
		$scope.user     = $localstorage.getObject('user');
		//$scope.org 		= $scope.user.company;
		var _URL_outlet = {
			_links : config.path.baseURL + config.path.outlets
		};

		// active page
		$scope.isActive = function (path) {
			return $location.path() === '/' + path ? true : false;
		};

		if (!$scope.user ||  (typeof $scope.user == 'object' && !$scope.user.username)) {
			$location.path('/app/login');
			return;
		}

		if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
			$ionicLoading.show();

			// GET BUSINESS
			ClientsService.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, _URL_outlet._links).then(function(res_data){
				if(res_data.status != 200 || typeof res_data != 'object') { return; }
				$ionicLoading.hide();
				// get data
				$scope.outlet_list = res_data.data._embedded.items;

				console.log($scope.outlet_list);

				angular.forEach($scope.outlet_list, function(item, i) {
					ClientsService.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, $scope.outlet_list[i]._links.location.href).then(function(res){
						if(res.status != 200 || typeof res != 'object') { return; }

						//$scope.outlets = res.data;
						console.log(res.data);

					}, function (err){
					  console.log('Connect API Sections fail!');
					  $ionicLoading.hide();
					});
				});
			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		}

		$scope.getAddressOutlet = function (id) {

		};
})
/**
 * F&B Ctrl
 */
.controller('fbCtrl', function ($scope, $location) {
	// active page
	$scope.isActive = function (path) {
		return $location.path() === '/' + path ? true : false;
	};
})
/**
 * Health Ctrl
 */
.controller('healthCtrl', function ($scope, $location) {
	// active page
	$scope.isActive = function (path) {
		return $location.path() === '/' + path ? true : false;
	};
})
/**
 * Kids Ctrl
 */
.controller('kidCtrl', function ($scope, $location) {
	// active page
	$scope.isActive = function (path) {
		return $location.path() === '/' + path ? true : false;
	};
})
/**
 * Location Ctrl
 */
.controller('locationCtrl', function ($scope, $location, $ionicLoading, $compile, $sce) {
	// active page
	$scope.isActive = function (path) {
		return $location.path() === '/' + path ? true : false;
	};


	$scope.init = function() {
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'AG BENEFIT'
        });

        google.maps.event.addListener(marker, 'click', function() {
         	infowindow.open(map,marker);
        });

        $scope.map = map;
        $('.blk-maps').height(window.screen.height);
    };

    // google.maps.event.addDomListener(window, 'load', initialize);
    //ionic.Platform.ready(init);
    $scope.centerOnMe = function() {
        if(!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };

    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };
})
/**
 * store detail Ctrl
 */
.controller('storeDetailCtrl', function ($scope) {

})
/**
 * main course Ctrl
 */
.controller('courseCtrl', function ($scope) {

})
/**
 * menu demo Ctrl
 */
.controller('menuDemoCtrl', function ($scope) {

})
;
