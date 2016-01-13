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
 * myOfferCtrl #/app/myoffer
 */
.controller('myOfferCtrl',
	function ($scope, $rootScope, $location, $stateParams,  $ionicPush, aRest, $localstorage, $ionicLoading) {
		$scope.cur_path = $location.path();
		$scope.user     = $localstorage.getObject('user');
		$scope.org 		= $scope.user.company;
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
			$scope.limit = 10;
			$scope.page  = 0;
			$scope.pagination = {
				pages : 2
			};
			$scope.outlet_list = [];
			$scope.noMoreItemsAvailable = false;

			// GET IMG
			/*if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
				aRest.get($scope.user.username
					, $scope.user.password
					, $scope.user.user.session_key
					, $scope.org._links.logo.href + '/url' ).then(function (res) {
					if (typeof res == 'object' && res.status == 200) {
						$scope.org['logo'] = res.data.url;
						$scope.user.company['logo'] = res.data.url;

						// STORE in LOCAL
						$localstorage.setObject('user', $scope.user);
					}
				}, function (err){
				 	console.log('Connect API IMG fail!');
				});
			}
*/
			// function load more offer
			$scope.loadOfferMore = function () {

				if($scope.page >= $scope.pagination.pages) {
					$scope.noMoreItemsAvailable = true;
					return;
				}
				if($scope.page <= 0) {
					$scope.page = 1;
					return;
				}
				// GET OUTLET LIST
				aRest.get($scope.user.username
								, $scope.user.password
								, $scope.user.user.session_key
								, _URL_outlet._links + '?search=outlet.enabled:1'
													+ '&limit=' + $scope.limit
													+ '&page=' + $scope.page ).then(function(res_data){
					//console.log(_URL_outlet._links + '?limit=' + $scope.limit + '&page=' + $scope.page);
					if(res_data.status != 200 || typeof res_data != 'object') { return; }
					//console.log(res_data.data.page);
					$ionicLoading.hide();

					// Get data
					$scope.outlet_list = $scope.outlet_list.concat(res_data.data._embedded.items);

					// Get Address
					_getOutletAddress(res_data.data._embedded.items, function (more_data) {
						//$scope.outlet_list = $scope.outlet_list.concat(more_data);
						angular.forEach(more_data, function(value, key) {
							var key = _getKeybyId($scope.outlet_list, value.id);
							$scope.outlet_list[key] = value;
						});
					});

					// Get LOGO of Bussiness
					_getOutletLogo(res_data.data._embedded.items, function (more_data) {
						angular.forEach(more_data, function(value, key) {
							var key = _getKeybyId($scope.outlet_list, value.id);
							$scope.outlet_list[key]['url_logo'] = value.url_logo;
						});
					});

					// Register paging
					$scope.pagination       = {
						"page": res_data.data.page,
						"limit": res_data.data.limit,
						"pages": res_data.data.pages,
						"total": res_data.data.total
					};
					$scope.page = res_data.data.page + 1;

					// Regis complete Page
					$scope.$broadcast('scroll.infiniteScrollComplete');

				}, function (err){
				  console.log('Connect API Sections fail!');
				  $ionicLoading.hide();
				});


			};

			_getKeybyId = function (obj, id) {
				var return_val = 0;
				angular.forEach(obj, function(value, key) {
					if (value.id == id) {
						return_val = key;
						return;
					}
				});
				return return_val;
			};

			_getOutletAddress = function (data_outlet, callback) {
				//console.log(data_outlet);
				if (!data_outlet.length) {return;}
				angular.forEach(data_outlet, function(item, i) {
					if( data_outlet[i]._links.location == undefined) { return; }

					aRest.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, data_outlet[i]._links.location.href).then(function(res){
						if(res.status != 200 || typeof res != 'object') { return; }

						// add address location
						data_outlet[i]['outlet_address'] = res.data.name;

						if (data_outlet.length-1 == i) {
							callback(data_outlet);
						}

					}, function (err){
					  console.log('Connect API Sections fail!');
					  $ionicLoading.hide();
					});
				});
			};

			// GET OUTLET LOGO
			_getOutletLogo = function (data_outlet, callback) {
				console.log(data_outlet);
				if (!data_outlet.length) {return;}
				angular.forEach(data_outlet, function(item, i) {
					//console.log( data_outlet[i]._links.business);
					if( data_outlet[i]._links.business == undefined) { return; }

					aRest.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, data_outlet[i]._links.business.href).then(function(res){
						if(res.status != 200 || typeof res != 'object') { return; }
						//console.log(res.data);
						aRest.get($scope.user.username
							, $scope.user.password
							, $scope.user.session_key
							, res.data._links.owner.href).then(function(res){
							if(res.status != 200 || typeof res != 'object') { return; }
							//console.log(res.data);
							aRest.get($scope.user.username
								, $scope.user.password
								, $scope.user.session_key
								, res.data._links.logo.href).then(function(res){
								if(res.status != 200 || typeof res != 'object') { return; }
								//console.log(res.data);
								aRest.get($scope.user.username
									, $scope.user.password
									, $scope.user.session_key
									, config.path.baseURL + res.data._links.url.href).then(function(res){
									if(res.status != 200 || typeof res != 'object') { return; }
									data_outlet[i]['url_logo'] = res.data.url;
									if (data_outlet.length-1 == i) {
										callback(data_outlet);
									}
								});
							});
						});
					}, function (err){
					  console.log('Connect API Sections fail!');
					  $ionicLoading.hide();
					});
				});
			};

			// ON SCROLL END
			$scope.$on('$stateChangeSuccess', function() {
				$scope.loadOfferMore();
		    });
		}
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
 * Location Ctrl MAP PAGE
 * 1. GET OUTLET LOCATION
 * 1.1 get outlet address
 * 1.2 get outlet bussiness
 * 1.3 get owner business (get logo)
 * 2. INIT MAPs
 */
.controller('locationCtrl',
	function ($scope, $rootScope, $location, $stateParams,  $ionicPush, aRest, $localstorage, $ionicLoading, $compile, $sce) {
	// 1. GET OUTLET LOCATION
	$scope.cur_path = $location.path();
	$scope.user     = $localstorage.getObject('user');
	$scope.org 		= $scope.user.company;
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
		// GET OUTLET LIST
		aRest.get($scope.user.username
						, $scope.user.password
						, $scope.user.user.session_key
						, _URL_outlet._links ).then(function(res_data){
			if(res_data.status != 200 || typeof res_data != 'object') { return; }
			$ionicLoading.hide();

			//get data
			$scope.outlet_list = res_data.data._embedded.items;

			// get outlet address
			_getOutletAddress($scope.outlet_list);


		}, function (err){
		  console.log('Connect API Sections fail!');
		  $ionicLoading.hide();
		});

		// 1.1 get outlet address
		_getOutletAddress = function (data_outlet) {
			angular.forEach(data_outlet, function(item, i) {
				if( data_outlet[i]._links.location == undefined) { return; }

				aRest.get($scope.user.username
						, $scope.user.password
						, $scope.user.session_key
						, data_outlet[i]._links.location.href).then(function(res){
					if(res.status != 200 || typeof res != 'object') { return; }

					// get outlet bussiness
					$scope.outlet_list[i]['logo_url']     = "";
					_getOutletBussiness(data_outlet[i], i, function() {
						// add address location
						$scope.outlet_list[i]['geo_location'] = res.data;
						console.log($scope.outlet_list);
						$scope.addMaker($scope.outlet_list[i], i);

						if (data_outlet.length-1 == i) {
							//console.log($scope.bounds);
							//$scope.map.fitBounds($scope.bounds);
						}
					});

				}, function (err){
				  console.log('Connect API Sections fail!');
				  $ionicLoading.hide();
				});
			});

		};
		// 1.2 get outlet bussiness
		_getOutletBussiness = function (data_outlet, index, callback) {
			if( data_outlet._links.business == undefined) { return; }

			aRest.get($scope.user.username
					, $scope.user.password
					, $scope.user.user.session_key
					, data_outlet._links.business.href).then(function(res){
				if(res.status != 200 || typeof res != 'object') { return; }

				$scope.outlet_business = res.data;

				// get owner business
				_getOwnerBusiness($scope.outlet_business, index, callback);

			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		};

		// 1.3 get owner business (get logo)
		_getOwnerBusiness = function (data_owner, index, callback) {
			aRest.get($scope.user.username
				, $scope.user.password
				, $scope.user.user.session_key
				, data_owner._links.owner.href).then(function(res_owner){

					// GET LOGO
					aRest.get($scope.user.username
						, $scope.user.password
						, $scope.user.user.session_key
						, res_owner.data._links.logo.href + '/url').then(function (res_logo) {

						if (typeof res_logo == 'object' && res_logo.status == 200) {
							$scope.outlet_list[index]['logo_url'] = res_logo.data.url;
						}

						callback();

					}, function (err){
					 	console.log('Connect API IMG fail!');
					});

			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		};
	}

	// 2. INIT MAPs
	$scope.init = function() {
        var myLatlng = new google.maps.LatLng(1.308122, 103.818424);

        var mapOptions = {
          center: myLatlng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        $scope.map = map;
        $scope.bounds = new google.maps.LatLngBounds();
        $('.blk-maps').height(window.screen.height);
    };

    // function add maker
    $scope.addMaker = function (data_outlet, index) {
    	if (!data_outlet.geo_location.geo_lat) {return;}
    	var myLatlng = new google.maps.LatLng(data_outlet.geo_location.geo_lat, data_outlet.geo_location.geo_lng);

    	$scope.bounds.extend(myLatlng);
    	//console.log(myLatlng);
        var marker = new google.maps.Marker({
          position: myLatlng,
          map: $scope.map,
          title: data_outlet.geo_location.name,
        });

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div class='pop-outlet'>"
        				  +		"<a href='#/app/store-detail/"+ data_outlet.id +"'>"
        				  +			"<figure><img ng-src='"+ $scope.outlet_list[index].logo_url +"'/></figure>"
        				  +			"<div class='out-info'><h3>"+ data_outlet.name +"</h3>"
        				  +				"<p>"+ data_outlet.geo_location.name +"</p>"
        				  +			"</div>"
        				  +		"</a>"
        				  +	"</div>";
        var compiled = $compile(contentString)($scope);

        var infowindow;
        infowindow = null;

        google.maps.event.addListener(marker, 'click', function() {
        	if(infowindow) {
	            infowindow.close();
	            infowindow = null;
	            return;
	        }
         	infowindow = new google.maps.InfoWindow({
	          content: compiled[0]
	        });
	        infowindow.open($scope.map, marker);
        });

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
.controller('storeDetailCtrl',
	function ($scope, $rootScope, $location, $stateParams, $ionicPush, $localstorage, $ionicLoading, aRest, $uibModal, $log) {
	// active page
	$scope.isActive = function (path) {
		return $location.path() === '/' + path ? true : false;
	};

	$scope.cur_path  = $location.path();
	$scope.user      = $localstorage.getObject('user');
	$scope.org 		 = $scope.user.company;
	$scope.outlet_id = $stateParams.outlet_id;
	console.log($scope.user.user);
	var _URL_outlet = {
			_links : config.path.baseURL + config.path.outlets
		};

	if (!$scope.user ||  (typeof $scope.user == 'object' && !$scope.user.username)) {
		$location.path('/app/login');
		return;
	}

	if(!$scope.outlet_id ) {
		$location.path('/app/myoffer');
		return;
	}

	if ($scope.user ||  (typeof $scope.user == 'object' && $scope.user.username)) {
		$ionicLoading.show();

		// DGET DETAIl OUTLET
		$scope.detail_outlet = {};
		aRest.get($scope.user.username
			, $scope.user.password
			, $scope.user.user.session_key
			, _URL_outlet._links + '?search=outlet.id:' + $scope.outlet_id).then(function(res_data){
				$ionicLoading.hide();

				if(!res_data.data._embedded.items ) {
					$location.path('/app/myoffer');
					return;
				}
				$scope.detail_outlet = res_data.data._embedded.items[0];

				// get outlet address
				_getOutletDetailAddress($scope.detail_outlet);
				console.log($scope.detail_outlet);
				// get outlet bussiness
				_getOutletBussiness($scope.detail_outlet);
				// get promotions business
				_getPromotionsBusiness($scope.detail_outlet);

		}, function (err){
		  console.log('Connect API Sections fail!');
		  $ionicLoading.hide();
		});

		// get outlet address
		_getOutletDetailAddress = function (data_outlet) {
			if( data_outlet._links.location == undefined) { return; }

			aRest.get($scope.user.username
					, $scope.user.password
					, $scope.user.user.session_key
					, data_outlet._links.location.href).then(function(res){
				if(res.status != 200 || typeof res != 'object') { return; }

				// add address location
				data_outlet['outlet_address'] = res.data.name;

			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		};

		// get outlet bussiness
		_getOutletBussiness = function (data_outlet) {
			if( data_outlet._links.business == undefined) { return; }

			aRest.get($scope.user.username
					, $scope.user.password
					, $scope.user.user.session_key
					, data_outlet._links.business.href).then(function(res){
				if(res.status != 200 || typeof res != 'object') { return; }

				$scope.outlet_business = res.data;

				// get owner business
				_getOwnerBusiness($scope.outlet_business);

				// get promotions business
				//_getPromotionsBusiness($scope.outlet_business);

			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		};

		// get owner business
		_getOwnerBusiness = function (data_owner) {
			aRest.get($scope.user.username
				, $scope.user.password
				, $scope.user.user.session_key
				, data_owner._links.owner.href).then(function(res_owner){
					if (typeof res_owner != 'object' && res_owner.status != 200) { return; }

					// about company
					$scope.detail_outlet['about_company'] = res_owner.data.about_company;
					$scope.detail_outlet['company_name'] = res_owner.data.name;
					$scope.detail_outlet['office_address'] = res_owner.data.office_address;
					$scope.detail_outlet['code'] = res_owner.data.code;
					$scope.detail_outlet['head_office_no'] = res_owner.data.head_office_no;
					$scope.detail_outlet['this_company']   = res_owner.data;

					// GET LOGO
					aRest.get($scope.user.username
						, $scope.user.password
						, $scope.user.user.session_key
						, res_owner.data._links.logo.href + '/url').then(function (res_logo) {
						if (typeof res_logo == 'object' && res_logo.status == 200) {
							$scope.detail_outlet['logo'] = res_logo.data.url;
						}
					}, function (err){
					 	console.log('Connect API IMG fail!');
					});

					// GET BANNERs
					console.log(res_owner.data._links);
					if(!res_owner.data._links.banners) { return;}
					aRest.get($scope.user.username
						, $scope.user.password
						, $scope.user.user.session_key
						, res_owner.data._links.banners.href).then(function (res) {
						if (typeof res == 'object' && res.status == 200) {

							var _URL_getBanner = config.path.baseURL + res.data._embedded.items[0]._links.url.href;
							console.log(_URL_getBanner);

							aRest.get($scope.user.username
								, $scope.user.password
								, $scope.user.user.session_key
								, _URL_getBanner).then(function (res_banner) {
								if (typeof res_banner == 'object' && res_banner.status == 200) {
									console.log(res_banner.data);
									$scope.detail_outlet['banner'] = res_banner.data.url;
								}
							}, function (err){
							 	console.log('Connect API BANNER fail!');
							});

						}
					}, function (err){
					 	console.log('Connect API BANNER fail!');
					});

			}, function (err){
			  console.log('Connect API Sections fail!');
			  $ionicLoading.hide();
			});
		};

		// get promotions buniness
		_getPromotionsBusiness = function (data_promotion) {
			if( data_promotion._links.promotions == undefined) { return; }

			aRest.get($scope.user.username
				, $scope.user.password
				, $scope.user.user.session_key
				, data_promotion._links.promotions.href + '?search=promotion.enabled:1').then(function(res_promotion){

				if (typeof res_promotion != 'object' && res_promotion.status != 200) { return; }

				$scope.detail_outlet['promotions'] = res_promotion.data;

			}, function (err){
				console.log('Connect API Sections fail!');
				$ionicLoading.hide();
			});
		};

		// function show modal
		$scope.openModalPromotion = function (data_promo, id) {
		    var modalInstance = $uibModal.open({
		      templateUrl: 'myPromotion.html',
		      controller: 'popPromotionCtrl',
		      resolve: {
		        items: function () {
		          return {
		          	data : $scope.detail_outlet,
		          	id : id
		          }
		        }
		      }
		    });

		    modalInstance.result.then(function (selectedItem) {
		      $scope.selected = selectedItem;
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
		  };
	}
})
/**
 * popPromotionCtrl
 */
.controller('popPromotionCtrl',
	function ($scope, $uibModalInstance, $location, $localstorage, items) {
		$scope.md_promotion = items.data.promotions._embedded.items[items.id];
		$scope.outlet_info  = items.data;
		$localstorage.setObject('outlets_promo', items.data);

		$scope.ok = function () {
			$uibModalInstance.close($scope.selected.item);
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.gotoRedeem = function() {
			$uibModalInstance.dismiss('cancel');
			$location.path('/app/main-course');
		};
})
/**
 * main course Ctrl
 */
.controller('courseCtrl',
	function ($scope, $uibModal, $location, $localstorage) {
		console.log($('.modal').length);
		if ($('.modal').length) {
			$('.modal').remove();
			$('.modal-backdrop').remove();
			$('body').removeClass('modal-open');
		}

		$scope.outlets_promo = $localstorage.getObject('outlets_promo');
		if (!$scope.outlets_promo || typeof $scope.outlets_promo != 'object') {
			$location.path('/app/myoffer');
			return;
		}
		$scope.user = $localstorage.getObject('user');
		console.log($scope.outlets_promo);
		$scope.pin_code   = [];
		$scope.redeem_cls = '';
		$scope.btn_text   = 'REDEEM';

		if ($scope.user.user.four_digit_pin && $scope.outlets_promo.this_company.redemption_password) {
			$scope.msg_error = "Enter your 4-Digit Pin to Redeem";
		} else {
			$scope.msg_error = 0;
		}

		$scope.submitPin = function () {

			if (!$scope.pin_code.length) {
				$scope.msg_error = 'Please enter your pin code!';
				if ($scope.redeem_cls == 'grey') {
					$scope.msg_error = 'Please enter redemption pass!';
				}
				return;
			} else if ($scope.pin_code.length < 4) {
				$scope.msg_error = 'Enter your 4-Digit Pin to Redeem';
				if ($scope.redeem_cls == 'grey') {
					$scope.msg_error = 'Please enter 4-Digit!';
				}
				return;
			}

			var redeem_code =  ' ' + $scope.pin_code[0] + $scope.pin_code[1] + $scope.pin_code[2] + $scope.pin_code[3];

			if ($scope.redeem_cls == 'grey') {
				if (redeem_code.trim() == $scope.outlets_promo.this_company.redemption_password.trim()) {
					$scope.msg_error  = 'OK';
					_openModalRedeem();
				} else {
					$scope.msg_error  = 'Wrong 4-Digit password';
				}
			} else {
				//console.log($scope.user.user.four_digit_pin);
				if (redeem_code.trim() == $scope.user.user.four_digit_pin.trim()) {
					$scope.msg_error  = 'Enter redemption password';
					$scope.redeem_cls = 'grey';
					$scope.btn_text   = 'Enter';
				} else {
					$scope.msg_error  = 'Wrong 4-Digit Pin';
					$scope.redeem_cls = '';
				}
			}
		}

		// function show modal
		_openModalRedeem = function () {
			var modalInstance = $uibModal.open({
				templateUrl: 'templates/modal/redeemModal.html',
				controller: 'redeemCtrl',
				resolve: {
				send_obj: function () {
				 	return {
				  		data : ''
				    }
				}
			}
			});

			modalInstance.result.then(function (selectedItem) {
			 	console.log(selectedItem);
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
})
/**
 * redeem demo Ctrl
 */
.controller('redeemCtrl'
	, function ($scope, $uibModalInstance, $location, $localstorage, send_obj) {

	$scope.outlets_promo = $localstorage.getObject('outlets_promo');
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

})
/**
 * menu demo Ctrl
 */
.controller('menuDemoCtrl', function ($scope) {

})
;
