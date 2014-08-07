angular.module('ads', ['ionic', 'openfb', 'ngResource'])

.run(function ($rootScope, $state, $ionicPlatform, $window, OpenFB,$location) {
      $rootScope.globalServerUrl="http://lodge39.com";
     // $rootScope.globalServerUrl="http://77.121.81.147";
      $rootScope.logged=localStorage.getItem("logged");
        OpenFB.init('803761662981098');

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
          document.addEventListener("backbutton", onBackKeyDown, false);

        });


      $rootScope.$on('$stateChangeStart', function(event, toState) {
          if (toState.name !== "signin" && toState.name !== "forgotpassword" && toState.name !== "registration" && localStorage.getItem("token")===null) {

            $state.go('signin');
           // event.preventDefault();

          }
      });
      function onBackKeyDown() {
        var cur=$state.current.name;
        switch (cur){
          case "homeselected":  $state.go('tabs.home'); break;
          case "selectedvideo":$state.go('homeselected');break;
          case "tabs.settings":$state.go('tabs.home');break;
          case "tabs.profile":$state.go('tabs.home');break;
          case "tabs.facebook":$state.go('tabs.home');break;
          case "tabs.home":$state.go('new');break;
          case "signin": if(navigator.app){navigator.app.exitApp();}
                         else if(navigator.device){navigator.device.exitApp();}
                         break;
          case "forgotpassword":$state.go('signin');break;
          case "registration2":$state.go('registration');break;
          case "registration":$state.go('signin');break;
          case "changepassword":$state.go('signin');break;
          case "new":localStorage.clear();$state.go('signin');break;
          }
       /* if($state('registration')){$state.go('signin');}
        if($state('registration2')){$state.go('registration');}
        if(localStorage.getItem("token")===null){
          if(navigator.app){
            navigator.app.exitApp();
          }else if(navigator.device){
            navigator.device.exitApp();
          }
        }*/
      };
      $rootScope.logout=function(){
        localStorage.setItem("logged", false);
        $state.go('signin');
        if(navigator.app){
          navigator.app.exitApp();
        }else if(navigator.device){
          navigator.device.exitApp();
        }
      };
       /* $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name !== "signin" &&  !$window.sessionStorage['fbtoken']) {
                $state.go('signin');
                event.preventDefault();
            }
        });

        $rootScope.$on('OAuthException', function() {
            $state.go('signin');
        });*/
        

    })


.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        var id;
        $httpProvider.defaults.useXDomain = true;

    $stateProvider
        .state('signin', { 
              url: "/sign-in", templateUrl: "sign-in.html", controller: 'SignInCtrl'})

        .state('forgotpassword', {
              url: "/forgot-password", templateUrl: "forgot-password.html", controller: "ForgotCtrl"})

        .state('registration', {
               url: "/registration", templateUrl: "registration.html", controller: "RegistrationCtrl"})

        .state('registration2', {
               url: "/registration2", templateUrl: "registration2.html", controller: "Registration2Ctrl"})

        .state('homeselected', {
               url: "/home-selected", templateUrl: "home-selected.html", controller: "HomeSelectedCtrl"})

        .state('selectedvideo', {
               url: "/selected-video", templateUrl: "selected-video.html", controller: "SelectedVideoCtrl"})

        .state('tabs', {
               url: "/tab", abstract: true, templateUrl: "tabs.html"})

        .state('change-password', {
          url: "/change-password", templateUrl: "change-password.html",controller:"ChangePasswordCtrl"})

        .state('new',{
          url: "/new",templateUrl:"new.html",controller:"NewPageCtrl"
        })

        .state('tabs.home', {
               url: "/home", 
                views: {'home-tab': { 
                  templateUrl: "home.html", controller: 'HomeTabCtrl'}
                }})

        .state('tabs.profile', {
               url: "/profile",
               views: {
               'profile-tab': {
                 templateUrl: "profile.html",controller: "ProfileTabCtrl"}
               }})

        .state('tabs.facebook', {
               url: "/facebook",
               views: {
               'facebook-tab': {
               templateUrl: "facebook.html", controller: "FacebookTabCtrl"}
               }})

        .state('tabs.settings', {
               url: "/settings",
               views: {
               'settings-tab': {
               templateUrl: "settings.html",
               controller: "LogoutCtrl"}
               }})

        .state('tabs.contact', {
               url: "/contact",
               views: {
               'contact-tab': {
               templateUrl: "contact.html"}
               }});
        
        $urlRouterProvider.otherwise("/sign-in");
})

.controller('SignInCtrl', function($scope, $state, OpenFB,$http, $rootScope, BalanceService) {
            $scope.user={};       
            $scope.word=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
            $scope.user.remember=false;
            $scope.text=" ";
            var url=$rootScope.globalServerUrl+'/profile/login/';

            $scope.signIn = function() {
              OpenFB.login('email,read_stream,publish_stream')
                .then(
                  function () {
                    $state.go('tabs.home');
                  },
                  function () {
                   window.plugins.toast.show('Fblogin error', 'short', 'center');
                  });
            };

            $scope.submit=function(){
              var data=JSON.stringify($scope.user);
              if(localStorage.getItem("logged")===null){
            window.plugins.toast.show('Loading...', 'short', 'center');
              }
              $http({
                  url: url,
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: 'data='+data
                }).success(function(data) {
                  if(data.login===true){
                    console.log(data);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("username", data.username);// work with it
                    localStorage.setItem("token", data.token);  // work with it
                    localStorage.setItem("password",$scope.user.password);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("limit",data.limit);
                    BalanceService.setBalance(data.balance/100);  // work with it
                    if($scope.user.remember){
                      localStorage.setItem("logged","true");
                    }

                     $state.go('new');
                  }
                  else{
                   window.plugins.toast.show('Incorrect login or password', 'long', 'bottom');
                   // $state.go('signin');
                  }                    
                }).error(function(){
                window.plugins.toast.show('Connection problems', 'long', 'bottom');
              });
              };
            if(localStorage.getItem("logged")==="true"){
              $scope.user.password=localStorage.getItem("password");
              $scope.user.login=localStorage.getItem("email");
              $scope.submit();
            }
            })

.controller('NewPageCtrl',function($scope,$state,BalanceService){
      $scope.balance=BalanceService.getBalance();
      $scope.viewAds=function(){
        $state.go('tabs.home');
      };
    })

.controller('ForgotCtrl',function($scope, $http,$state, $rootScope){
     $scope.request=function(email){
       var url=$rootScope.globalServerUrl+'/profile/resetPassword/';
       var data=email;
       $http({
         url: url,
         method: "POST",
         headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
         data: 'data='+JSON.stringify(data)
       }).success(function(data){
         if(!data.resetPassword){
           window.plugins.toast.show('Sorry, your email not founded in database', 'long', 'bottom');
         }
         else{
           window.plugins.toast.show('Your new password sended to your email', 'long', 'bottom');
           $state.go('signin');
         }
       });
     };

    })
    .controller('LogoutCtrl',function($scope,$state){
      $scope.clear=function(){
        localStorage.clear();
        $state.go('signin');
      };
    })

.controller('HomeTabCtrl', function($scope, $http, HomeService, $state,$resource, $rootScope, BalanceService) {
    $scope.category={};
      $scope.balance=BalanceService.getBalance();
    var url = $rootScope.globalServerUrl;
    var data={};
    data.id=localStorage.getItem("id");

      ///timezone
      function getTimezoneName() {
        tmSummer = new Date(Date.UTC(2005, 6, 30, 0, 0, 0, 0));
        so = -1 * tmSummer.getTimezoneOffset();
        tmWinter = new Date(Date.UTC(2005, 12, 30, 0, 0, 0, 0));
        wo = -1 * tmWinter.getTimezoneOffset();

        if (-660 == so && -660 == wo) return 'Pacific/Midway';
        if (-600 == so && -600 == wo) return 'Pacific/Tahiti';
        if (-570 == so && -570 == wo) return 'Pacific/Marquesas';
        if (-540 == so && -600 == wo) return 'America/Adak';
        if (-540 == so && -540 == wo) return 'Pacific/Gambier';
        if (-480 == so && -540 == wo) return 'US/Alaska';
        if (-480 == so && -480 == wo) return 'Pacific/Pitcairn';
        if (-420 == so && -480 == wo) return 'US/Pacific';
        if (-420 == so && -420 == wo) return 'US/Arizona';
        if (-360 == so && -420 == wo) return 'US/Mountain';
        if (-360 == so && -360 == wo) return 'America/Guatemala';
        if (-360 == so && -300 == wo) return 'Pacific/Easter';
        if (-300 == so && -360 == wo) return 'US/Central';
        if (-300 == so && -300 == wo) return 'America/Bogota';
        if (-240 == so && -300 == wo) return 'US/Eastern';
        if (-240 == so && -240 == wo) return 'America/Caracas';
        if (-240 == so && -180 == wo) return 'America/Santiago';
        if (-180 == so && -240 == wo) return 'Canada/Atlantic';
        if (-180 == so && -180 == wo) return 'America/Montevideo';
        if (-180 == so && -120 == wo) return 'America/Sao_Paulo';
        if (-150 == so && -210 == wo) return 'America/St_Johns';
        if (-120 == so && -180 == wo) return 'America/Godthab';
        if (-120 == so && -120 == wo) return 'America/Noronha';
        if (-60 == so && -60 == wo) return 'Atlantic/Cape_Verde';
        if (0 == so && -60 == wo) return 'Atlantic/Azores';
        if (0 == so && 0 == wo) return 'Africa/Casablanca';
        if (60 == so && 0 == wo) return 'Europe/London';
        if (60 == so && 60 == wo) return 'Africa/Algiers';
        if (60 == so && 120 == wo) return 'Africa/Windhoek';
        if (120 == so && 60 == wo) return 'Europe/Amsterdam';
        if (120 == so && 120 == wo) return 'Africa/Harare';
        if (180 == so && 120 == wo) return 'Europe/Athens';
        if (180 == so && 180 == wo) return 'Africa/Nairobi';
        if (240 == so && 180 == wo) return 'Europe/Moscow';
        if (240 == so && 240 == wo) return 'Asia/Dubai';
        if (270 == so && 210 == wo) return 'Asia/Tehran';
        if (270 == so && 270 == wo) return 'Asia/Kabul';
        if (300 == so && 240 == wo) return 'Asia/Baku';
        if (300 == so && 300 == wo) return 'Asia/Karachi';
        if (330 == so && 330 == wo) return 'Asia/Calcutta';
        if (345 == so && 345 == wo) return 'Asia/Katmandu';
        if (360 == so && 300 == wo) return 'Asia/Yekaterinburg';
        if (360 == so && 360 == wo) return 'Asia/Colombo';
        if (390 == so && 390 == wo) return 'Asia/Rangoon';
        if (420 == so && 360 == wo) return 'Asia/Almaty';
        if (420 == so && 420 == wo) return 'Asia/Bangkok';
        if (480 == so && 420 == wo) return 'Asia/Krasnoyarsk';
        if (480 == so && 480 == wo) return 'Australia/Perth';
        if (540 == so && 480 == wo) return 'Asia/Irkutsk';
        if (540 == so && 540 == wo) return 'Asia/Tokyo';
        if (570 == so && 570 == wo) return 'Australia/Darwin';
        if (570 == so && 630 == wo) return 'Australia/Adelaide';
        if (600 == so && 540 == wo) return 'Asia/Yakutsk';
        if (600 == so && 600 == wo) return 'Australia/Brisbane';
        if (600 == so && 660 == wo) return 'Australia/Sydney';
        if (630 == so && 660 == wo) return 'Australia/Lord_Howe';
        if (660 == so && 600 == wo) return 'Asia/Vladivostok';
        if (660 == so && 660 == wo) return 'Pacific/Guadalcanal';
        if (690 == so && 690 == wo) return 'Pacific/Norfolk';
        if (720 == so && 660 == wo) return 'Asia/Magadan';
        if (720 == so && 720 == wo) return 'Pacific/Fiji';
        if (720 == so && 780 == wo) return 'Pacific/Auckland';
        if (765 == so && 825 == wo) return 'Pacific/Chatham';
        if (780 == so && 780 == wo) return 'Pacific/Enderbury'
        if (840 == so && 840 == wo) return 'Pacific/Kiritimati';
        return 'US/Pacific';
      }



      ////timezone


       $http({
          url: url+"/main/getAdCategories",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+JSON.stringify(data)
        }).success(function(data){
          $scope.category=data;
        });

        $scope.getCategoryVideos=function(id){
              $scope.videoThumbUrl=url+"/public/video/thumb/";
              $scope.videoUrl=url+"/public/video/";
              
              $scope.imageThumbUrl=url+"/public/picture/thumb/";
              $scope.imageUrl=url+"/public/picture/";
           var idSet={
             id:localStorage.getItem("id"),
             category:id,
             timezone:getTimezoneName()
           }
          $http({
            url: url+"/main/getAdByCategory",
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            data: "data="+JSON.stringify(idSet)
          }).success(function(data){
           // findById(data.ad,data.watched[0].id);
            for (index = 0; index < data.ad.length; ++index) {
              if(data.ad[index].type==="video"){
                data.ad[index].thumbnail= $scope.videoThumbUrl+data.ad[index].thumbnail;
                data.ad[index].src= $scope.videoUrl+data.ad[index].src;
                for (var i = 0; i < data.watched.length; i++) {
                  if (data.ad[index].id === data.watched[i].id) {
                    data.ad[index].watched=true;
                  }
                }
              }
              else{
                data.ad[index].thumbnail= $scope.imageThumbUrl+data.ad[index].thumbnail;
                data.ad[index].src= $scope.imageUrl+data.ad[index].src;
                for (var i = 0; i < data.watched.length; i++) {
                  if (data.ad[index].id === data.watched[i].id) {
                    data.ad[index].watched=true;
                  }
                }
              }
            }
            console.log(data.ad);
            localStorage.setItem("currentLimit",data.limit);
            HomeService.setVideoUrl(data.ad); //result[0]
            HomeService.setVideosByCategory(data.ad);
          });
           $state.go('homeselected');
       }

   })

.controller('ProfileTabCtrl', function($scope, $http, ProfileService,BalanceService, ajaxServices, $q,$state,$timeout, $rootScope, $filter) {
    var data={};
    var url= $rootScope.globalServerUrl;
    $scope.balance=BalanceService.getBalance();
    $scope.user={};
    data.token=localStorage.getItem("token");
    data.email=localStorage.getItem("email");
      $scope.CountryList = $http({method:"GET",url: url+'/tag/getCountries'}) ;
      $scope.EducationList = $http({method:"GET",url:url+'/tag/getEducations'});
      $scope.SexList = $http({method:"GET",url:url+'/tag/getSex'});
      $scope.ProfessionList = $http({method:"GET",url:url+'/tag/getProfessions'});
      window.plugins.toast.show('Loading profile information', 'short', 'center');
      $scope.userData = $http({
          url: url+"/profile/getProfile",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+JSON.stringify(data)
      });




    $q.all([$scope.CountryList, $scope.EducationList, $scope.SexList, $scope.userData,$scope.ProfessionList]).then(function(res) {

      $scope.CountryList=res[0].data;
      $scope.EducationList=res[1].data;
      $scope.SexList=res[2].data;
      $scope.userData=res[3].data;
      $scope.ProfessionList=res[4].data;
      $scope.CityList=ajaxServices.getProjects($scope.userData[0].country).success(function (data) {
        $scope.CityList=data;
        $scope.user.city=$scope.CityList[findById($scope.CityList,$scope.userData[0].city)].id;
      });

      $scope.user.date = $scope.userData[0].birthday?$filter('date')($scope.userData[0].birthday*1000, "yyyy-MM-dd"):"";
      $scope.user.country=$scope.CountryList[$scope.userData[0].country-1];
      $scope.user.education=$scope.EducationList[$scope.userData[0].education-1];
      $scope.user.sex=$scope.SexList[$scope.userData[0].sex];
      $scope.user.firstName=$scope.userData[0].firstName;
      $scope.user.lastName=$scope.userData[0].lastName;
      $scope.user.profession=$scope.ProfessionList[$scope.userData[0].profession-1];
      $scope.user.street=$scope.userData[0].street;

      function findById(source, id) {
        for (var i = 0; i < source.length; i++) {
          if (source[i].id === id) {
            return i;//source[i];
          }
        }
        throw "Couldn't find object with id: " + id;
      };
    });

      $scope.setCountry=function(id){
        $http({method:"GET",url:url+'/tag/getCities/'+id})   //ready
            .success(function(data){
              $scope.CityList=data;
            });
      }


    $scope.submit=function(){
      var profileData={};

      profileData.birthday=$scope.user.date?Math.round(+new Date($scope.user.date)/1000):"";
      profileData.id=localStorage.getItem('id');
      profileData.country=$scope.user.country?$scope.user.country.id:"";
      profileData.education=$scope.user.education?$scope.user.education.id:"";
      profileData.profession=$scope.user.profession?$scope.user.profession.id:"";
      profileData.sex=$scope.user.sex?$scope.user.sex.id:"";
      profileData.email=data.email;
      profileData.token=data.token;
      profileData.firstName=$scope.user.firstName?$scope.user.firstName:"";
      profileData.lastName=$scope.user.lastName?$scope.user.lastName:"";

      profileData.street=$scope.user.street?$scope.user.street:"";
      profileData.city=$scope.user.city?$scope.user.city:"";

      console.log(profileData);
      $http({
          url: url+"/profile/setProfile/",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+encodeURIComponent(JSON.stringify(profileData))
      }).success(function(){
      window.plugins.toast.show('Profile updated', 'short', 'center');
        $state.go('tabs.home');
      }).error(function(){
       window.plugins.toast.show('Error', 'short', 'center');
      });
    };


})

.controller('FacebookTabCtrl', function($scope, $http, BalanceService) {
             $scope.balance=BalanceService.getBalance();
            var ref = window.open('http://facebook.com', '_blank', 'location=yes');
            //ref.addEventListener('loadstart', function() { alert(event.url); });
            })

.controller('RegistrationCtrl', function($scope, $http,$location,IdService, $rootScope) {
            var x,y;
            var serverUrl=$rootScope.globalServerUrl;
            $scope.user={}; 

            $scope.wordPattern=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.namePattern=/^[a-zA-Z]+$/;
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 

            $scope.checkEmail=function(){
                var url=serverUrl+'/profile/checkEmail/';
                var check=$scope.user.email;
              $http({
                url: url,
                method: "POST",
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                data: "data="+JSON.stringify(check)
              }).success(function(data){
                  if(!data.checkEmail){
                    x=0;
                  } 
                  else {
                    x=1;
                  } 
                });
            };
            $scope.checkUsername=function(){
              var url=serverUrl+'/profile/checkUsername/';
              var check=$scope.user.username;
              $http({
                url: url,
                method: "POST",
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                data: "data="+JSON.stringify(check)
              }).success(function(data){
                if(!data.checkUsername){
                  y=0;
                }
                else {
                  y=1;
                }
              });
            };

            $scope.submit=function(){
                var data=$scope.user;
                var url=serverUrl+'/profile/registrationFirstStep/';
                if(!y){
                  window.plugins.toast.show('Current username already taken', 'short', 'center');
                  console.log('username taken');
                }
                if(!x){
                  window.plugins.toast.show('Current email already taken', 'short', 'center');
                  console.log('email taken');
                }
                else{
                  $http({
                    url: url,
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    data: "data=" + JSON.stringify(data)
                  }).success(function(data){
                    console.log(data);
                    localStorage.setItem("id",data.id);
                    localStorage.setItem("email",$scope.user.email);
                    $location.path('/registration2');
                  });


                }
              };
                
            })

.controller('Registration2Ctrl', function($scope, $http, IdService ,ProfileService, BalanceService, $rootScope, $state,$timeout) {
      $scope.user={"street":"","firstName":"","lastName":""};

      $scope.wordPattern=/^[a-zA-Z0-9]+$/;
      var req={};
      var serverUrl=$rootScope.globalServerUrl;

      $http({method:"GET",url: serverUrl+'/tag/getCountries'})   //ready
        .success(function(data){
          $scope.CountryList=data;
        });

      $http({method:"GET",url:serverUrl+'/tag/getEducations'})   //ready
        .success(function(data){
          $scope.EducationList=data;
        });

      $http({method:"GET",url:serverUrl+'/tag/getSex'})   //ready
        .success(function(data){
          $scope.SexList=data;
        });

      $http({method:"GET",url:serverUrl+'/tag/getProfessions'})
          .success(function(data){
            $scope.ProfessionList=data;
          });

      $scope.setCountry=function(id){
        $http({method:"GET",url:serverUrl+'/tag/getCities/'+id})   //ready
            .success(function(data){
              $scope.CityList=data;
            });
      }

      $scope.submit=function(){

                req={
                    "id":localStorage.getItem('id'),
                    "email":localStorage.getItem('email'),
                    "country":$scope.user.country?$scope.user.country.id:"",
                    "birthday":$scope.user.date?Math.round(+new Date($scope.user.date)/1000):"",
                    "education":$scope.user.education?$scope.user.education.id:"",
                    "sex":$scope.user.sex?$scope.user.sex.id:"",
                    "city":$scope.user.city?$scope.user.city.id:"",
                    "profession":$scope.user.profession?$scope.user.profession.id:"",
                    "street":$scope.user.street,
                    "skip":"false",
                    "firstName":$scope.user.firstName,
                    "lastName":$scope.user.lastName
                };

                console.log(req);

              var url=serverUrl+'/profile/registrationSecondStep/';
              $http({
                url: url,
                method: "POST",
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                data: "data=" + JSON.stringify(req)
              }).success(function(data){
                localStorage.setItem("token",data.login.token);
                localStorage.setItem("limit",data.limit);
                console.log(data.balance);
                localStorage.setItem("balance",data.balance);
              });

              $timeout(function(){
                $state.go('tabs.home');
              },1000);
            }
})
.controller('HomeSelectedCtrl', function($scope,$ionicSlideBoxDelegate ,HomeService, BalanceService, $http, $state,$timeout){
    $scope.img=false;
    $scope.currentPage = 0;
    $scope.pageSize = 9;
    $scope.data = {};
      $scope.balance=BalanceService.getBalance();
      window.plugins.toast.show('Loading...', 'short', 'center');
    $timeout(function(){
      $scope.data=HomeService.getVideosList();
      console.log($scope.data);
      $scope.img=true;
    },2000);

  $scope.numberOfPages=function(){
    return Math.ceil($scope.data.length/$scope.pageSize);
  }
  $scope.getTimes=function(){
    //return new Array(Math.ceil($scope.data.length/$scope.pageSize));
  };
  $scope.change=function(index){
    $scope.currentPage=index;
    setTimeout(function(){
      $ionicSlideBoxDelegate.update();
    },5000);
    console.log(index);
  };


  $scope.show=function(id){
    var cur=localStorage.getItem("currentLimit");
    var limit=localStorage.getItem("limit");
if(cur<limit){
  if(!$scope.data[id].watched) {
    HomeService.setUrl(HomeService.getUrl(id));
    HomeService.setMediaType(id);
    HomeService.setMediaDuration(id);
    HomeService.setMediaId(id);
    $state.go('selectedvideo');
    window.plugins.toast.show('Loading...', 'short', 'center');
  }
  else{
    console.log('watched' + $scope.data[id].watched);
    window.plugins.toast.show('Watched today', 'short', 'center');
  }
}
    else{
  console.log("limit expired");
  window.plugins.toast.show('Limit expired', 'short', 'center');
}


  };
})

.controller('ChangePasswordCtrl',function($scope,$http,$rootScope, $state){
      $scope.user={};
      $scope.wordPattern=/^[a-zA-Z0-9]+$/; //password regexp
      var email=localStorage.getItem("email");
      var url=$rootScope.globalServerUrl+'/profile/updatePassword/';



      $scope.submit=function(){
        $scope.data={
          login:localStorage.getItem("email"),
          password:$scope.user.oldPassword
        };
        console.log("login:"+$scope.data);
        $http({
          url: $rootScope.globalServerUrl+'/profile/login/',
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data=" + JSON.stringify($scope.data)
        }).success(function(data){
          if(data.login===true){
            $scope.update={
              password:$scope.user.password,
              email:localStorage.getItem("email"),
              token:data.token
            }
            localStorage.setItem("token",data.token);
            console.log("update:"+$scope.update);
            $http({
              url: url,
              method: "POST",
              headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
              data: "data=" + JSON.stringify($scope.update)
            }).success(function(data){
              window.plugins.toast.show('Updated', 'short', 'center');
              $state.go('tabs.home');
            });
          }
          else{
            window.plugins.toast.show('Wrong old password', 'short', 'center');
          }

        });
      }
})

.controller('SelectedVideoCtrl', function($scope,HomeService, BalanceService, $ionicPopup,$ionicModal, $ionicSlideBoxDelegate,$location, $state, $timeout ,$sce,$rootScope,$http) {

      $scope.counter = 0;
      $scope.minPlayingTime = HomeService.getMediaDuration();
      $scope.mediaId = HomeService.getMediaId();
      $scope.balance = BalanceService.getBalance();
      $scope.notShown = "true";
      var readyState = false;
      var mytimeout;
      var data = {};
      var AdTextImage = document.getElementById("AdTextImage");
      var AdTextVideo = document.getElementById("AdTextVideo");
      $scope.onTimeout = function () {
        $scope.counter++;
        console.log($scope.counter);
        var mytimeout = $timeout($scope.onTimeout, 1000);
      };

      if (HomeService.getMediaType() === "picture") {
        $scope.viewName = "Picture";
        $scope.source = $sce.trustAsResourceUrl(HomeService.getU());
        var init = function () {
          $timeout(function () {
            $scope.openModal();
          }, 0);

          $timeout(function () {
            $scope.image = "false";
            $scope.notShown = "false";
            asd();
            $scope.closeModal();
          }, $scope.minPlayingTime * 1000);
        }


      $ionicModal.fromTemplateUrl('image-modal.html', {
        scope: $scope,
        animation: 'slide-left-right'
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function () {
        $scope.modal.show();
      };

      $scope.closeModal = function () {

        $scope.modal.hide();
      };

      $scope.$on('$destroy', function () {
        $scope.modal.remove();
      });
      init();
    }

  else{
    if(device.platform==="Android"){
      $scope.video="false";

      $scope.adCounter = 0;
      $scope.onAdTimeout = function(){

        if($scope.adCounter<$scope.minPlayingTime){
          $scope.notShown="true";
          $scope.adCounter++;
          adTimeout = $timeout($scope.onAdTimeout,1000);
        }
        else{
          $scope.adCounter=0;
          $timeout.cancel(adTimeout);
          asd();
          $scope.notShown="false";
        }
      }
      var adTimeout = $timeout($scope.onAdTimeout,1000);
      VideoPlayer.play(HomeService.getU());

    }
    else {   //not andoid*/
      $scope.video = "true";
      $scope.viewName="Video";
      $scope.source = $sce.trustAsResourceUrl(HomeService.getU());

      $timeout(function () {
        var video = document.getElementById("vid");

        video.addEventListener('play', function () {
          video.play();
          mytimeout = $timeout($scope.onTimeout, 1000);
        }, false);



        video.addEventListener("pause", function () {
          if ($scope.counter >= $scope.minPlayingTime) {
            $timeout.cancel(mytimeout);
            $scope.counter = 0;
              video.remove();
              $scope.video=false;
            $scope.notShown="false";
              asd();
          }
          else {
            $scope.notShown="true";
            $timeout.cancel(mytimeout);
          }
        }, false);
      }, 0);
   }
 };
function asd(){

            var adUrl = $rootScope.globalServerUrl + "/main/getAdQuestion/";
            $http.get(adUrl + $scope.mediaId).then(function (response) {

              $scope.questions = response.data.question;
              $scope.answer = response.data.answers;
              $scope.click = function (id) {
                data.ad = $scope.mediaId;
                data.answer = id;
                data.email = localStorage.getItem("email");
                data.token = localStorage.getItem("token");
                $http({
                  url: $rootScope.globalServerUrl + "/main/hit",
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: "data=" + JSON.stringify(data)
                }).success(function (data) {
                  if(data.hit===true){
                    BalanceService.setBalance(data.balance/100);
                    window.plugins.toast.show('Right answer', 'short', 'center');
                  }
                  else{
                    window.plugins.toast.show('Wrong answer', 'short', 'center');
                  }
                  readyState = true;
                  $state.go('tabs.home');
                });
              }
            });
};

})

.service('ProfileService', function($http){
  var profile={};
  return {
    getProfile: function(){
      return profile;
    },
    setProfile: function(data){
      profile=data;
    }
  };
})

.service('HomeService', function($rootScope, $http){
  var videosList=[];
  var videoUrl="";
  var serverUrl=$rootScope.globalServerUrl;
  var questions=[];
      var url;
      var type;
      var duration;
      var mediaId;

  return{
    setVideosByCategory: function(data){
      videosList=data;
    },
    getVideosList: function(){
      return videosList;
    },
    setVideoUrl: function(data){
      videoUrl=data;
    },
    getVideoUrl: function(){
      return videoUrl.src;
    },
    getMediaType: function(){
      return type;
    },
    setMediaType: function(id){
      type=videoUrl[id].type;
    },
    getMediaDuration: function(){
      return duration;
    },
    setMediaDuration: function(id){
      duration=videoUrl[id].duration;
    },
    getMediaId: function(){
      return mediaId;
    },
    setMediaId: function(id){
      mediaId=videoUrl[id].id;
    },
    getUrl:function(id){
      return videoUrl[id].src;
    },
    setUrl:function(src){
        url=src;
    },
    getU:function(){
      return url;
    }
  };
})

    .service('BalanceService',function(){
      return {
        setBalance:function(balance){
          console.log(balance);
          localStorage.setItem("balance",balance);
        },
        getBalance: function(){
          return localStorage.getItem("balance");
        }
      }
})

.service('IdService', function(){
    var id={};     
         return {
            getId:function(){
                return id;
            },
            setId:function(data){
                id=data;
            }
         };
})

.directive('validated', ['$parse', function($parse) {
    return {
      restrict: 'AEC',
      require: '^form',
      link: function(scope, element, attrs, form) {
        var inputs = element.find("*");
        for(var i = 0; i < inputs.length; i++) {
          (function(input){
            var attributes = input.attributes;
            if (attributes.getNamedItem('ng-model') != void 0 && attributes.getNamedItem('name') != void 0) {
              var field = form[attributes.name.value];
              if (field != void 0) {
                angular.element(input).bind('blur',function(){
                  scope.$apply(function(){
                    field.$blurred = true;
                  })
                });
                scope.$watch(function() {
                  return form.$submitted + "_" + field.$valid + "_" + field.$blurred;
                }, function() {
                  if (!field.$blurred && form.$submitted != true) return;
                  var inp = angular.element(input);
                  if (inp.hasClass('ng-invalid')) {
                    element.removeClass('has-success');
                    element.addClass('has-error');
                  } else {
                    element.removeClass('has-error').addClass('has-success');
                  }
                });
              }
            }
          })(inputs[i]);
        }
      }
    }
  }])

.directive('match', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
    })
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
})
    .factory('ajaxServices',  function ($http,$rootScope) {
      var url = $rootScope.globalServerUrl;


        return {
          getProjects : function (id) {
            return $http({method: "GET", url: url + '/tag/getCities/' + id});
          }
        }

    })

;


