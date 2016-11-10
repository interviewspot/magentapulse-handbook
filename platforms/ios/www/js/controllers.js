/**
 * STARTER APP
 */
angular.module('starter.controllers', [])

/**
 * AppCtrl All site.
 */
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, $ionicPush, $location, rAPI, $tool_fn) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    $scope.isSigned = false;
    $scope.$on('$ionicView.enter', function(e) {
        
        // CHECK USER
        $scope.user = $localstorage.getObject('user');
        _checkUserLogin();
        if ($scope.user && $scope.user.username) {
            $scope.isSigned = true;
        } else {
            $scope.isSigned = false;
            $location.path('/app/login');
        }

        // GET SETTINS
        $scope.settings = $localstorage.getObject('settings');

    });

    stop_browser_behavior: false

    self.touchStart = function(e) {
      self.startCoordinates = getPointerCoordinates(e);

      if ( ionic.tap.ignoreScrollStart(e) ) {
        return;
      }

      if( ionic.tap.containsOrIsTextInput(e.target) ) {
        // do not start if the target is a text input
        // if there is a touchmove on this input, then we can start the scroll
        self.__hasStarted = false;
        return;
      }

      self.__isSelectable = true;
      self.__enableScrollY =  true;
      self.__hasStarted = true;
      self.doTouchStart(e.touches, e.timeStamp);
      // e.preventDefault();
    };

    var _checkUserLogin = function() {
        //console.log($scope.user);
        if ( $tool_fn._isEmpty($scope.user) ) {return;} 
        
        var checkUrl = $scope.user.user._links.self.href;
        // var checkUrl = config.path.baseURL + '/system';
        // checkUrl = 'http://api-live.sg-benefits.com/users/19/positions';
        rAPI.get($scope.user.user.session_key, checkUrl).then(function (res) {
            //console.log ('USER again', res.data);
            if (!res.data.enabled) {
                $location.path('/app/logout');
                location.reload();
            }
        }, function (err) {
            console.log('ERROR 1 : Not connect API User, try later!');
            if (err.status != 0) {
                $location.path('/app/logout');
                location.reload();
            }
        });
    };
})
/**
 * LoginCtrl
 */
.controller('LoginCtrl', function($scope, $stateParams, $location, $ionicPush, LoginService, 
                            $ionicLoading, $localstorage, OrgService,
                            eAPI) {
    $scope.loginData = {};
    $scope.user = $localstorage.getObject('user');
    $scope.noCompayCode = false;
    $scope.noUserCode   = false;
    

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

        if (!isValid) { return isValid; }

        $scope.noCompayCode = false;
        $scope.noUserCode   = false;

        $ionicLoading.show();
        // LOGIN SYS
        var loginSysUrl = config.path.baseURL + '/system';
        eAPI.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim(), loginSysUrl)
        .then(function (res){
            
            // console.log('sysLog', res.data);
            var logState = res.data;
            if (typeof res == 'object' && res.status == 200) {
                
                // GET USER  -------------
                eAPI.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim(), config.path.baseURL + logState._links.logged_in_user.href)
                .then(function (res){
                    $ionicLoading.hide();
                    if (typeof res == 'object' && res.status == 200) {
                        //console.log('sysLog2', res.data);
                        var userdata = res.data;

                        // GET COMPANY  -------------
                        eAPI.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim(),  config.path.baseURL + logState._links.logged_in_position.href)
                        .then(function (res){
                            if (typeof res == 'object' && res.status == 200) {
                                //console.log('sysLog2', res.data);
                                var thisposition = res.data;

                                // GET COMPANY employer  -------------
                                eAPI.get($scope.loginData.company_code.trim(), $scope.loginData.user_code.trim(),  thisposition._links.employer.href)
                                .then(function (res){
                                    if (typeof res == 'object' && res.status == 200) {
                                        console.log('sysLog2', res.data);
                                        // LOGGED SUCESS
                                        $localstorage.setObject('user', {
                                            username : $scope.loginData.company_code.trim(),
                                            password : $scope.loginData.user_code.trim(),
                                            company  : res.data,
                                            user     : userdata
                                        });
                                        $location.path('/app/handbooks');
                                        location.reload();
                                    }
                                }, function (err){
                                    $ionicLoading.hide();
                                    if (err.data) {
                                        alert('ERROR ' + err.data.message);
                                    } else {
                                        alert('ERROR 2.3 : Not connect API Company, try later!');
                                    }
                                });
                                
                            }
                        }, function (err){
                            $ionicLoading.hide();
                            if (err.data) {
                                alert('ERROR ' + err.data.message);
                            } else {
                                alert('ERROR 2.2 : Not connect API Company, try later!');
                            }
                        });
                        
                    } // END: GET USER
                }, function (err){
                    $ionicLoading.hide();
                    if (err.data) {
                        alert('ERROR ' + err.data.message);
                    } else {
                        alert('ERROR 2.1 : Not connect API, try later!');
                    }
                });
            }
        }, function (err){
            $ionicLoading.hide();
            if (err.data) {
                alert('ERROR ' + err.data.message);
            } else {
                alert('ERROR 2 : Not connect API, try later!');
            }
        }); // END: LOGIN SYS

    }; // END : dologin
        
})
/**
 * LogoutCtrl
 */
.controller('LogoutCtrl', function($scope, $stateParams, $localstorage, $location, $ionicHistory) {

    $scope.$on('$ionicView.enter', function(e) {
        $scope.user = null;
        $localstorage.reset();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache().then(function(){
            $location.path('/app/login');
        });
    });
})

/**
 * HandbooksCtrl : HANDBOOKs PAGE
 */
.controller('HandbooksCtrl',
    function($scope, $rootScope, $location, $stateParams, $ionicPush, HandbookService, SectionService,
            $localstorage, $ionicLoading, OrgService, ImgService, $tool_fn, rAPI) {
    $scope.cur_path = $location.path();
    $scope.user     = $localstorage.getObject('user');
        $rootScope.listHandbookId = [];

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
            rAPI.get( $scope.user.user.session_key
                         , $scope.org._links.logo.href).then(function (res) {

                if (typeof res == 'object' && res.status == 200) {
                    //console.log(res.data._links);
                    rAPI.get( $scope.user.user.session_key
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

        $_handbooks = $localstorage.getObject('handbooks');

        // GET HANDBOOKs
        if ($scope.org._links.handbooks) {
            var ony_active = "?search=handbook.enabled:1";
            console.log($scope.user);
            rAPI.get($scope.user.user.session_key
                              , $scope.org._links.handbooks.href + ony_active).then(function (return_data){

                $scope.handbooks = [];
                $ionicLoading.hide();
                if (typeof return_data.data != 'object' || !return_data.data._embedded ) {return;}
                console.log (return_data.data);
                // CHECK UPDATE CACHE
                var updateCache = $tool_fn._checkHandbookChange(return_data.data, $_handbooks);
                // console.log (updateCache);
                $localstorage.setObject('updateCache', updateCache);

                if (updateCache) {
                    // console.log('_____translation');
                    $scope.handbooks = return_data.data;
                    // GET LANG
                    angular.forEach($scope.handbooks._embedded.items, function(item, i) {
                        $rootScope.listHandbookId[i] = item.id;
                        rAPI.get( $scope.user.user.session_key
                                          , item._links.translations.href ).then(function (res){
                            if (typeof res == 'object' && res.status == 200) {
                                $scope.handbooks._embedded.items[i]['lang'] = res.data;

                                // STORE in LOCAL
                                $localstorage.setObject('handbooks', $scope.handbooks);
                            }
                        }, function (err){
                            console.log('Connect API Handbooks language fail!');
                            alert("Connect the internet to get data!");
                            $ionicLoading.hide();
                        });
                    });
                } else {
                    $scope.handbooks = $_handbooks;
                    angular.forEach($scope.handbooks._embedded.items, function(item, i) {
                        $rootScope.listHandbookId[i] = item.id;
                    });
                }
                $localstorage.setObject('listHandbookId',$rootScope.listHandbookId);


            }, function (err){
                console.log('Connect API Handbooks fail!');
                $ionicLoading.hide();
                if (!$_handbooks) {
                    alert("Connect the internet to get data!");
                } else {
                    $scope.handbooks = $_handbooks;
                }
            });
        } else {
            $ionicLoading.hide();
            if ($_handbooks) {
                $scope.handbooks = $_handbooks;
            } else {
                $scope.handbooks = []; // NO HANDBOOK
                if (!$scope.handbooks) {
                    alert("Connect the internet to get data!");
                }
            }
        }
    }
})

/**
 * HandbookCtrl : HANDBOOK PAGE
 */
.controller('HandbookCtrl', function($scope, $rootScope, $location, $stateParams,
                                    $ionicPush, HandbookService, SectionService,
                                    $localstorage, $ionicLoading, OrgService, ImgService,
                                    $tool_fn, $ionicModal, 
                                    $cordovaFileTransfer, $cordovaFile, $ionicPlatform, $window,
                                    rAPI,$ionicSideMenuDelegate
                                    ) {
    $ionicSideMenuDelegate.canDragContent(false);
    $scope.cur_path = $location.path();
    $scope.user     = $localstorage.getObject('user');
    $scope.handbook_id = $stateParams.handbook_id
    //console.log($scope.user );
    $scope.refreshCached = function () {
        $localstorage.setObject('handbook_' + $scope.handbook_id, {});
        $localstorage.setObject('handbook_' + $scope.handbook_id, {});
        $localstorage.setObject('hdsections_' + $scope.handbook_id, {});
        location.reload();
    };


    // REgis MOdal box
    $ionicModal.fromTemplateUrl('templates/modal-zoom-img.html', {
        scope: $scope,
        cordovaFileTransfer : $cordovaFileTransfer
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Open Modal Zimg
    $scope.openModalZImg = function(afile) {
        $scope.modal.show();
        $scope.fileUrl = afile;
        $scope.tmodal  = {
            "type"  : "zimg",
            "title" : "View Image"
        };
    };

    // Open Modal PDF
    $scope.openModalPDF = function(afile) {
        
        function showModal(bfile) {

            $scope.pdfUrl   = getCacheDir() + bfile.pdf_info.name;
            // alert($scope.pdfUrl);
            $scope.modal.show();
            $scope.tmodal  = {
                "type"  : "pdf",
                "title" : "View PDF"
            };
        }

        var getCacheDir = function() {};
        if ($window.cordova) {
            var getCacheDir = function() {
                if (window.device)
                    if (window.cordova.file) {
                        switch (device.platform) {
                            case 'iOS':
                                return $window.cordova.file.documentsDirectory;
                            case 'Android':
                                return $window.cordova.file.dataDirectory;
                            case 'windows':
                                return $window.cordova.file.dataDirectory;
                        }
                    } else
                        throw new Error("window.cordova.file is not defined! Maybe you should install cordova-plugin-file first!");
                else
                    throw new Error("window.device is not defined! Maybe you should install cordova-plugin-device first!");
                return '';
            };

            $ionicPlatform
                .ready(function() {

                // alert(getCacheDir() + afile.pdf_info.name);

                $cordovaFile.checkFile(getCacheDir(), afile.pdf_info.name)
                .then(function (success) {
                // success
                    console.log('cache ok, load ' + getCacheDir()); 
                    showModal(afile);
                    return;
                }, function (error) {
                // error
                    console.log('cache Failed, load ' + getCacheDir()); 
                    //  DOWNLOAD FILE
                    $cordovaFileTransfer.download(afile.pdf_file.url, getCacheDir() + afile.pdf_info.name, {}, true)
                    .then(function(result) {
                        console.log('ok', result);
                        showModal(afile);
                    }, function(err) {
                        console.log('err', err);
                    // Error
                    }, function (progress) {
                        $timeout(function () {
                            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                        });
                    }); // END: Down file
                }); // END: check file
            }); // END: $ionicPlatform


        } else {
            //pdfDelegate.$getByHandle('my-pdf-container').zoomTo(1.5);
            $scope.pdfUrl   = 'pdf/lesson2.pdf';
            // $scope.pdfUrl   = afile.pdf_info.name;
            //console.log('openM', afile.pdf_info.name);
            $scope.modal.show();
            $scope.tmodal  = {
                "type"  : "pdf",
                "title" : "View PDF"
            };
        }

    }; // END: 

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
        if (a.ordering < b.ordering)
            return -1;
        if (a.ordering > b.ordering)
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
            rAPI.get( $scope.user.user.session_key
                         , $scope.org._links.logo.href).then(function (res) {

                if (typeof res == 'object' && res.status == 200) {
                    //console.log(res.data._links);
                    rAPI.get( $scope.user.user.session_key
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
        $scope.handbook     = $localstorage.getObject('handbook_' + $scope.handbook_id);
        var $_handbook      = $localstorage.getObject('handbook_' + $scope.handbook_id);
        var $local_handbook = $localstorage.getObject('hdsections_' + $scope.handbook_id);
        $scope.sections = $local_handbook.data;
        //var updateCache = $localstorage.getObject('updateCache');
        console.log('local_handbook', $local_handbook);
        
        // GET HANDBOOK
        rAPI.get( $scope.user.user.session_key
                            , $scope.org._links.handbooks.href + "/" +  $scope.handbook_id).then(function (return_data){
            $scope.handbook = return_data.data;
            $scope.ch_color = '#' + 'cfae79';
            $ionicLoading.hide();
            //console.log($_handbook);
            if (($_handbook
                && $_handbook.version == $scope.handbook.version
                && $_handbook.lang)
                || (typeof $_handbook == "object"
                    && $_handbook.version
                    && $_handbook.version == $scope.handbook.version)) {
                $localstorage.setObject('updateCache', false);
                return;
            } else {
                $localstorage.setObject('updateCache', true);
            }

            // GET HANDBOOK LANG
            rAPI.get( $scope.user.user.session_key
                              , $scope.handbook._links.translations.href ).then(function (res){
                if (typeof res == 'object' && res.status == 200) {
                    $scope.handbook['lang'] = res.data;

                    // STORE in LOCAL
                    $localstorage.setObject('handbook_' + $scope.handbook_id, $scope.handbook);
                }
            }, function (err){
                console.log ('Connect API Handbooks language fail!');
                $ionicLoading.hide();
                if (!$scope.handbook) {
                    alert("Connect the internet to get data!");
                }
            });

            // LOCAL HANDBOOK OR NOT [sections]
            //console.log('Local sections', $local_handbook);
            //console.log('version hb', $scope.handbook.version);
            if (($local_handbook
                && $local_handbook.version == $scope.handbook.version)
                || (typeof $local_handbook == "object"
                    && $local_handbook.version
                    && $local_handbook.version == $scope.handbook.version
                    )
                ) {
                $ionicLoading.hide();
                $scope.sections = $local_handbook.data;
                console.log('sections', $scope.sections);
            } else {

                // GET SECTIONS of A HANDBOOK
                // ?search=section.parent{null}1
                rAPI.get( $scope.user.user.session_key
                                 , $scope.handbook._links.sections.href + "?search=section.parent{null}1&limit=500").then(function (return_data){
                    $ionicLoading.hide();
                    $scope.sections = return_data.data._embedded.items;
                    // console.log($scope.sections);
                    // TRANSLATE SECTION lvel 1
                    angular.forEach(return_data.data._embedded.items, function(item, i) {
                        // console.log(i +" =  "+$scope.sections[i].ordering);
                        $scope.sections[i].ordering = parseInt($scope.sections[i].ordering);
                        (function(itemInstance) {
                            // Find child for section
                            if (item._links.children) {
                                _loadChildSection(item);
                            }
                            // console.log(item);

                            // LOAD LANG
                            rAPI.get( $scope.user.user.session_key
                                              , itemInstance._links.translations.href ).then(function (res){
                                if (typeof res == 'object' && res.status == 200) {

                                    $scope.sections[i]['lang'] = res.data;
                                    // STORE in LOCAL
                                    $localstorage.setObject('hdsections_' + $scope.handbook_id, {
                                        version : $scope.handbook.version,
                                        data    : $scope.sections
                                    });
                                }
                            }, function (err){
                                console.log('Connect API Sections language fail!');
                                $ionicLoading.hide();
                            });

                            // LOAD CONTENT (IMG)
                            rAPI.get( $scope.user.user.session_key
                                              , itemInstance._links.contents.href ).then(function (res){
                                if (typeof res == 'object' && res.status == 200 && res.data.total != 0) {
                                    $scope.sections[i]['blk_img'] = new Array();
                                    $scope.sections[i]['blk_pdf'] = new Array();
                                    // GET IMAGE URL
                                    console.log('content_', res.data);
                                    angular.forEach(res.data._embedded.items, function(item, key) {
                                    //    console.log(key);
                                    // console.log(item._links.image_url.href);
                                    
                                        rAPI.get( $scope.user.user.session_key
                                              , item._links.image_url.href + '?locale=en_us' ).then(function (res){
                                            //console.log('IMG_URL', res.data.image_url);
                                            if (res.data.image_url) {
                                                $scope.sections[i]['blk_img'].push(res.data.image_url);
                                                // STORE in LOCAL
                                                $localstorage.setObject('hdsections_' + $scope.handbook_id, {
                                                    version : $scope.handbook.version,
                                                    data    : $scope.sections
                                                });
                                            } else {

                                                // GET PDF
                                                rAPI.get( $scope.user.user.session_key
                                                  , item._links.pdf.href + '?locale=en_us' ).then(function (res){
                                                    console.log("o1: ",res.data);
                                                    if (!res.data) {return;}

                                                    // GET PDF URL
                                                    rAPI.get( $scope.user.user.session_key
                                                      , config.path.baseURL + res.data._links.url.href  ).then(function (res2){
                                                        var pdf_data = {
                                                            pdf_info : res.data,
                                                            pdf_file : res2.data
                                                        };
                                                        $scope.sections[i]['blk_pdf'].push(pdf_data);
                                                        // STORE in LOCAL
                                                        $localstorage.setObject('hdsections_' + $scope.handbook_id, {
                                                            version : $scope.handbook.version,
                                                            data    : $scope.sections
                                                        });
                                                    }, function(err) {
                                                        console.log('Connect API PDF URL fail!');
                                                        $ionicLoading.hide();
                                                    });

                                                }, function(err) {
                                                    console.log('Connect API PDF URL fail!');
                                                    $ionicLoading.hide();
                                                });
                                            }
                                        }, function (err){
                                           // console.log('Connect API IMAGE URL fail!');
                                            $ionicLoading.hide();
                                        });

                                    });
                                }
                            }, function (err){
                                console.log('Connect API Sections IMG fail!');
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
                  if (!$scope.handbook.version) {
                    alert("Connect the internet to get data!");
                    $location.path('/app/handbooks');
                  }
                });
            }

        }, function (err){
            console.log('Connect API Handbook fail!');
            //console.log($_handbook);
            $ionicLoading.hide();
            if (!$scope.handbook.version) {
                alert("Connect the internet to get data!");
                $location.path('/app/handbooks');
            }
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
        if ($section.children) {return;}
        //console.log($section.children._embedded);
        if ($section._links.children) {
            //console.log($section.id);
            var j = _findKeyArrayByValue($scope.sections, 'id', $section.id);
            //console.log(j);

            $ionicLoading.show();
            rAPI.get( $scope.user.user.session_key
                  , $section._links.children.href ).then(function (res){
                $ionicLoading.hide();
                $scope.sections[j].children = res.data;

                // Scan each and get LANG & IMAGE
                angular.forEach(res.data._embedded.items, function(item, k) {
                        (function(itemInstance) {
                            // GET CONTENTS
                            rAPI.get( $scope.user.user.session_key
                                              , itemInstance._links.contents.href ).then(function (res){
                                if (typeof res == 'object' && res.status == 200 && res.data.total != 0) {
                                    $scope.sections[j].children._embedded.items[k]['blk_img'] = new Array();
                                    $scope.sections[j].children._embedded.items[k]['blk_pdf'] = new Array();

                                    // GET IMAGE URL
                                    angular.forEach(res.data._embedded.items, function(item, key) {
                                    //    console.log(key);
                                    // console.log(item._links.image_url.href);
                                        
                                        rAPI.get( $scope.user.user.session_key
                                              , item._links.image_url.href + '?locale=en_us' ).then(function (res){
                                            //console.log('IMG_URL', res.data.image_url);
                                            if (res.data.image_url) {
                                                $scope.sections[j].children._embedded.items[k]['blk_img'].push(res.data.image_url);
                                                $localstorage.setObject('hdsections_' + $scope.handbook_id, {
                                                    version : $scope.handbook.version,
                                                    data    : $scope.sections
                                                });
                                            } else {

                                                // GET PDF
                                                rAPI.get( $scope.user.user.session_key
                                                  , item._links.pdf.href + '?locale=en_us' ).then(function (res){
                                                    //console.log("o1: ",res.data);
                                                    if (!res.data) {return;}

                                                    // GET PDF URL
                                                    rAPI.get( $scope.user.user.session_key
                                                      , config.path.baseURL + res.data._links.url.href  ).then(function (res2){
                                                        var pdf_data = {
                                                            pdf_info : res.data,
                                                            pdf_file : res2.data
                                                        };
                                                        $scope.sections[j].children._embedded.items[k]['blk_pdf'].push(pdf_data);
                                                        // STORE in LOCAL
                                                        $localstorage.setObject('hdsections_' + $scope.handbook_id, {
                                                            version : $scope.handbook.version,
                                                            data    : $scope.sections
                                                        });
                                                    }, function(err) {
                                                        console.log('Connect API PDF URL fail!');
                                                        $ionicLoading.hide();
                                                    });

                                                }, function(err) {
                                                    console.log('Connect API PDF URL fail!');
                                                    $ionicLoading.hide();
                                                });
                                            }

                                        }, function (err){
                                            console.log('Connect API IMAGE URL fail!');
                                            $ionicLoading.hide();
                                        });



                                    });
                                }
                            }, function (err){
                                console.log('Connect API Sections contents fail!');
                                $ionicLoading.hide();
                            });

                            // Translate child section
                            rAPI.get($scope.user.user.session_key
                                              , itemInstance._links.translations.href ).then(function (res){
                                if (typeof res == 'object' && res.status == 200) {

                                    //res.data._embedded.items[i]['lang'] = res.data;
                                    // STORE in LOCAL
                                    $scope.sections[j].children._embedded.items[k]['lang'] = res.data;
                                    $scope.sections[j].children._embedded.items[k].ordering = parseInt($scope.sections[j].children._embedded.items[k].ordering);
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
        _checkUserLogin();
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
        _checkUserLogin();
        if ($scope.isSubGroupShown(group)) {
            $scope.shownSubGroup = null;
        } else {
          $scope.shownSubGroup = group;
        }
    };

    $scope.isSubGroupShown = function(group) {
        return $scope.shownSubGroup === group;
    };
    
    var _checkUserLogin = function() {
        //console.log('zo');
        if ( $tool_fn._isEmpty($scope.user) ) {return;} 
        
        var checkUrl = $scope.user.user._links.self.href;
        // var checkUrl = config.path.baseURL + '/system';
        // checkUrl = 'http://api-live.sg-benefits.com/users/19/positions';
        rAPI.get($scope.user.user.session_key, checkUrl).then(function (res) {
            console.log ('USER again 2', res.data);
            if (!res.data.enabled) {
                $location.path('/app/logout');
                location.reload();
            }
        }, function (err) {
            console.log('ERROR 1 : Not connect API User, try later!');
            if (err.status != 0) {
                $location.path('/app/logout');
                location.reload();
            }
        });
    };

    $scope.onSwipeLeft = function(){
        var listHandbookId = $localstorage.getObject('listHandbookId');
        var handbookId = parseInt($scope.handbook_id);

        var indexCurrent = listHandbookId.indexOf(handbookId);
        var indexCurrentNext = indexCurrent+1;
        if(listHandbookId[indexCurrentNext] != undefined){
            var handbookIdNext = listHandbookId[indexCurrentNext];
            $location.path('/app/handbook/'+handbookIdNext);
            location.reload();
        }
        console.log('left');
    };
    $scope.onSwipeRight = function(){
        var listHandbookId = $localstorage.getObject('listHandbookId');
        var handbookId = parseInt($scope.handbook_id);

        var indexCurrent = listHandbookId.indexOf(handbookId);
        var indexCurrentPrev = indexCurrent-1;
        if(listHandbookId[indexCurrentPrev] != undefined){
            var handbookIdPrev = listHandbookId[indexCurrentPrev];
            $location.path('/app/handbook/'+handbookIdPrev);
            location.reload();
        }
        console.log('right');
    };


})

/**
 * ContactCtrl : CONTACT PAGE
 */
.controller('ContactCtrl',
    function($scope, $rootScope, $location, $stateParams,
            rAPI, $ionicPush, HandbookService,
            $localstorage, $ionicLoading, OrgService, ImgService,
            $tool_fn) {
    $scope.cur_path = $location.path();
    $scope.user     = $localstorage.getObject('user');
    // console.log($scope.user);
    $scope.org      = $scope.user.company;
    $_handbooks     = $localstorage.getObject('handbooks');


    $scope.refreshCached = function () {
        $localstorage.setObject('contacts', {});
        location.reload();
    };

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
        $scope.contacts = $localstorage.getObject('contacts');
        if ($scope.contacts) {
            $scope.contacts = $scope.contacts.data;
        }

        // GET IMG
        if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
            rAPI.get($scope.user.user.session_key
                         , $scope.org._links.logo.href).then(function (res) {

                if (typeof res == 'object' && res.status == 200) {
                    //console.log(res.data._links);
                    rAPI.get($scope.user.user.session_key
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

        // if ($scope.contacts) {
        //  $ionicLoading.hide();
        //  return;
        // }

        // ------------------------------
        // GET CONTACT
        _GetContactAPI = function () {
            // body...
            $scope.ch_color = '#' + 'cfae79';
            rAPI.get($scope.user.user.session_key
                    , $scope.org._links.positions.href + "?search=position.handbookContact:1,position.enabled:1").then(function (contact_res){

                var data = contact_res.data
                console.log("_____contacts", data);
                if (data._embedded.items.length > 0) {
                    $scope.contacts = [];
                    angular.forEach(data._embedded.items, function(item, i) {
                        $scope.contacts[i] = {};
                        rAPI.get($scope.user.user.session_key
                                           , item._links.employee.href).then(function (res){
                            $scope.contacts[i]['position'] = item;
                            $scope.contacts[i]['user']     = res.data;
                            $scope.contacts[i]['alphabet'] = res.data.first_name.charAt(0).toLowerCase()

                            // STORE in LOCAL
                            $localstorage.setObject('contacts', {
                                "data" : $scope.contacts
                            });


                            // GET employee_classes
                            if (item._links.employee_classes) {
                                rAPI.get($scope.user.user.session_key
                                               , item._links.employee_classes.href).then(function (res){
                                    $scope.contacts[i]['position']['employee_classes'] = res.data
                                    // STORE in LOCAL
                                    $localstorage.setObject('contacts', {
                                        "data" : $scope.contacts
                                    });
                                });
                            }

                            // GET employee_functions
                            if (item._links.employee_classes) {
                                rAPI.get($scope.user.user.session_key
                                               , item._links.employee_functions.href).then(function (res){
                                    $scope.contacts[i]['position']['employee_functions'] = res.data
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
                if (!$scope.contacts) {
                    alert("Connect the internet to get data!");
                }
            });
        }

        // GET HANDBOOKs & THEN UPDATE CONTACT FROM API
        _GetContactAPI();
        if ($scope.org._links.handbooks) {
            var ony_active = "?search=handbook.enabled:1";
            rAPI.get($scope.user.user.session_key
                    , $scope.org._links.handbooks.href + ony_active).then(function (return_data){

                // CHECK UPDATE CACHE
                var updateCache = $tool_fn._checkHandbookChange(return_data.data, $_handbooks);
                console.log ('Upcache', updateCache);
                $ionicLoading.hide();
            }, function (err){
                $ionicLoading.hide();
                console.log(err.status + ' : Connect API fail!');

                if (!$scope.contacts) {
                    alert("Connect the internet to get new data!");
                }

            });
        }


    }
})


/**
 * NotificationCtrl : Notification PAGE
 */
.controller('NotificationCtrl',
    function($scope, $rootScope, $location, $stateParams, rAPI, $localstorage, $ionicLoading, $ionicPush, OrgService, ImgService) {
    $scope.cur_path = $location.path();
    $scope.user     = $localstorage.getObject('user');
    $scope.org      = $scope.user.company;
    $scope.notifis  = [];


    if (!$scope.user) {
        $location.path('/app/login');
    } else {
        $ionicLoading.show();

        // GET IMG
        if (typeof $scope.org._links.logo == 'object' && $scope.org._links.logo.href) {
            rAPI.get( $scope.user.user.session_key
                         , $scope.org._links.logo.href).then(function (res) {

                if (typeof res == 'object' && res.status == 200) {
                    //console.log(res.data._links);
                    rAPI.get( $scope.user.user.session_key
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
        rAPI.get($scope.user.user.session_key
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
        // $scope.readIt = function (notifi) {

        //     if (notifi.read == true) {return;}
        //     notifi.read = true;
        //     console.log(notifi);
        //     return;
        //     var link        = notifi._links.self.href;
        //     var send_data = {
        //         message : {
        //             "read" : true,
        //             "sender": $scope.org.id,
        //             "recipient": $scope.org.id
        //         }
        //     };
        //     console.log(send_data);

        //     OrgService.update($scope.user.username
        //              , $scope.user.password
        //              , link
        //              , send_data ).then(function (res) {
        //         if (typeof res == 'object' && res.status == 204) {
        //             console.log('Ok');
        //         }
        //     }, function (err){
        //         console.log('Error');
        //     });
        // }
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