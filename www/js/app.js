angular.module('ads', ['ionic', 'openfb', 'ngResource'])

.run(function ($rootScope, $state, $ionicPlatform, $window, OpenFB) {
        $rootScope.globalServerUrl="http://77.121.81.147";
        OpenFB.init('803761662981098');

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

        });

     /* $rootScope.$on('$stateChangeStart', function(event, toState) {
        if (toState.name !== "signin" &&  localStorage.getItem('password')===null) {

          console.log('not logged');
          $state.go('signin');
          event.preventDefault();
        }
      });*/

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

.controller('SignInCtrl', function($scope, $state, OpenFB,$http, $rootScope) {
            $scope.user={};       
            $scope.word=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
            $scope.user.remember=false;
            var url=$rootScope.globalServerUrl+'/profile/login/';

            $scope.signIn = function() {
              OpenFB.login('email,read_stream,publish_stream')
                .then(
                  function () {
                    $state.go('tabs.home');
                  },
                  function () {
                   alert('OpenFB login failed');
                  });
            };
          
            $scope.submit=function(){
              var data=encodeURIComponent(JSON.stringify($scope.user));
              localStorage.setItem("password",$scope.user.password);
              $http({
                  url: url,
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: 'data='+data
                }).success(function(data) {
                  if(data.login==="true"){
                    localStorage.setItem("email", data.email);  // work with it
                    localStorage.setItem("token", data.token);  // work with it
                  /*  if($scope.user.remember){

                    } */

                     $state.go('tabs.home');
                  }
                  else{
                    $state.go('signin');
                  }                    
                });
              };

            })

.controller('ForgotCtrl',function($scope, $http, $rootScope){
     $scope.request=function(){
       var url=$rootScope.globalServerUrl+'/forgotpasswordurl';   //TALK ABOUT IT
       var data=encodeURIComponent(JSON.stringify($scope.email));

       $http({
         url: url,
         method: "POST",
         data: 'data='+data
       }).success(function(data){
         if(data.SERVERRESPONSE==="true"){
           alert('Password sended to email');
         }
         else{
           alert('Email not found');
         }
       });
     };

    })
    .controller('LogoutCtrl',function($scope,$state){
      $scope.logout=function(){
        localStorage.clear();
        $state.go('signin');
      };
    })

.controller('HomeTabCtrl', function($scope, $http, HomeService, $state,$resource, $rootScope) {
    $scope.category={};
    var url = $rootScope.globalServerUrl;
    var data={};
    data.token=localStorage.getItem("token");
    data.email=localStorage.getItem("email");

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

          var Videos = $resource(url+'/main/getAdByCategory/:catId/9');
           var videoList = Videos.query({catId:id});
           videoList.$promise.then(function (result) {
            if(result[0].type==="video"){
                result[0].thumbnail= $scope.videoThumbUrl+result[0].thumbnail;
                result[0].src= $scope.videoUrl+result[0].src
              }
            else{
                result[0].thumbnail= $scope.imageThumbUrl+result[0].thumbnail;
                result[0].src= $scope.imageUrl+result[0].src
            }

                HomeService.setVideoUrl(result[0]);
                HomeService.setVideosByCategory(result);
            console.log(result);
            });
                   
           
           $state.go('homeselected');
       }
   })

.controller('ProfileTabCtrl', function($scope, $http, ProfileService, $q, $rootScope, $filter) {
    var data={};
    var url= $rootScope.globalServerUrl;
    $scope.user={};

    data.token=localStorage.getItem("token");
    data.email=localStorage.getItem("email");
      $scope.CountryList = $http({method:"GET",url: url+'/tag/getCountries'}) ;
      $scope.EducationList = $http({method:"GET",url:url+'/tag/getEducations'});
      $scope.SexList = $http({method:"GET",url:url+'/tag/getSex'});
      $scope.CityList = [{id:0,name:"NY"},{id:1,name:"NY"},{id:2,name:"NY"},{id:3,name:"NY"}];
      $scope.userData = $http({
          url: url+"/profile/getProfile",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+JSON.stringify(data)
      });

    $q.all([$scope.CountryList, $scope.EducationList, $scope.SexList, $scope.userData]).then(function(res) {

      $scope.CountryList=res[0].data;
      $scope.EducationList=res[1].data;
      //$scope.EducationList=[{id:0,education:"asd"},{id:1,education:"asd"},{id:2,education:"asd"},{id:3,education:"asd"}];
      $scope.SexList=res[2].data;
      $scope.userData=res[3].data;


      $scope.user.date= $filter('date')($scope.userData[0].birthday*1000, "yyyy-MM-dd");
      $scope.user.country=$scope.CountryList[$scope.userData[0].country-1];
      $scope.user.education=$scope.EducationList[$scope.userData[0].education-1];
      $scope.user.sex=$scope.SexList[$scope.userData[0].sex];
      $scope.user.first_name=$scope.userData[0].first_name;
      $scope.user.last_name=$scope.userData[0].last_name;
      $scope.user.city=$scope.CityList;//$scope.CityList[$scope.userData[0].city-1];
      $scope.user.street="selected street";//$scope.userData[0].street;
    });

    $scope.submit=function(){
      var profileData={};

      profileData.birthday=$scope.user.date?Math.round(+new Date($scope.user.date)/1000):"";
      profileData.id=localStorage.getItem('id');
      profileData.country=$scope.user.country?$scope.user.country.id:"";
      profileData.education=$scope.user.education?$scope.user.education.id:"";
      profileData.sex=$scope.user.sex?$scope.user.sex.id:"";
      profileData.email=data.email;
      profileData.token=data.token;
      profileData.first_name=$scope.user.first_name?$scope.user.first_name:"";
      profileData.last_name=$scope.user.last_name?$scope.user.last_name:"";


      profileData.street=$scope.user.street?$scope.user.street:"";
      profileData.city=$scope.user.city?$scope.user.city.id:"";

      console.log(profileData);
      $http({
          url: url+"/profile/setProfile/",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+encodeURIComponent(JSON.stringify(profileData))
      });
    };

})

.controller('FacebookTabCtrl', function($scope, $http) {
            var ref = window.open('http://facebook.com', '_blank', 'location=yes');
            //ref.addEventListener('loadstart', function() { alert(event.url); });
            })

.controller('RegistrationCtrl', function($scope, $http,$location,IdService, $rootScope) {
            var x;
            var serverUrl=$rootScope.globalServerUrl;
            $scope.user={}; 

            $scope.wordPattern=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.namePattern=/^[a-zA-Z]+$/;
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 

            $scope.checkEmail=function(){
                var url=serverUrl+'/profile/checkEmail/';
                var check=encodeURIComponent('{"email":"'+$scope.user.email +'"}');

                var emailCheck=$http({method:"GET",url:url+check})
                 .success(function(data){
                  if(data.checkEmail==="false"){
                    x=0;
                  } 
                  else {
                    x=1;
                  } 
                });
            };

            $scope.submit=function(){
                var data=encodeURIComponent(JSON.stringify($scope.user));
                var url=serverUrl+'/profile/registrationFirstStep/';
                if(!x){
                  console.log('Current email already taken');
                }
                else{
                    $http.get(url+data).success(function(data){
                      localStorage.setItem("id",data.id);
                    });
                $location.path('/registration2');
                }
              };
                
            })

.controller('Registration2Ctrl', function($scope, $http, IdService ,ProfileService, $rootScope, $state) {
            $scope.user={"street":""};

      $scope.CityList=[{id:0,name:"NY"},{id:1,name:"NY"},{id:2,name:"NY"},{id:3,name:"NY"}];
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

            /*$http({method:"GET",url:serverUrl+'/tag/getSex'})   //CITY
                .success(function(data){
                  $scope.SexList=data;
                });*/

      $scope.submit=function(){
                var req={};
                req.id=localStorage.getItem('id');
                req.country=$scope.user.country?$scope.user.country.id:"";
                req.birthday=$scope.user.date?Math.round(+new Date($scope.user.date)/1000):"";
                req.education=$scope.user.education?$scope.user.education.id:"";
                req.sex=$scope.user.sex?$scope.user.sex.id:"";
                req.city=$scope.user.city?$scope.user.city.id:"";
                req.street=$scope.user.street;
                req.skip="false";
                console.log(req);
              var data=encodeURIComponent(JSON.stringify(req));
              var url=serverUrl+'/profile/registrationSecondStep/';
              $http.get(url+data);
              $state.go('signin');
            } 
            $scope.skip=function(){
               var req={};
               req.id=localStorage.getItem('id');
               req.skip="true";
              var data=encodeURIComponent(JSON.stringify(req));
              var url=serverUrl+'/profile/registrationSecondStep/';
              $http.get(url+data);
              $state.go('signin');
            } ;       
})
.controller('HomeSelectedCtrl', function($scope,$ionicSlideBoxDelegate ,HomeService, $http, $state,$timeout){
    $scope.img=false;
    $scope.currentPage = 0;
    $scope.pageSize = 9;
    $scope.data = {};
    $timeout(function(){
      $scope.data=HomeService.getVideosList();
      $scope.img=true;
    },500)

    $scope.numberOfPages=function(){
        return Math.ceil($scope.data.length/$scope.pageSize);                
    }
    $scope.getTimes=function(){
        return new Array(Math.ceil($scope.data.length/$scope.pageSize));
    };
      
  $scope.show=function(id){
    console.log(id);
    $state.go('selectedvideo');
  };
})

.controller('SelectedVideoCtrl', function($scope,HomeService,$ionicPopup,$ionicSlideBoxDelegate,$location, $state, $timeout ,$sce,$rootScope,$http){

   $scope.counter = 0;
   $scope.minPlayingTime =  HomeService.getMediaDuration();
   $scope.mediaId=HomeService.getMediaId();
   var readyState=false;
   var data={};
   var AdText=document.getElementById("AdText");
   $scope.onTimeout = function(){
      $scope.counter++;
      console.log($scope.counter);
      mytimeout = $timeout($scope.onTimeout,1000);
    };

  if(HomeService.getMediaType()==="picture"){
    $scope.image="true";
    $scope.source=$sce.trustAsResourceUrl(HomeService.getVideoUrl()); 
    var init=function(){

      $timeout(function(){
        
              var adUrl=$rootScope.globalServerUrl+"/main/getAdQuestion/";
              $http.get(adUrl+$scope.mediaId).then(function(response){
               $scope.image="false";
               AdText.remove();
               $scope.questions=response.data.question;
               $scope.answer=response.data.answers;
               $scope.click=function(id){
                data.ad=$scope.mediaId;
                data.answer=id;
                data.email=localStorage.getItem("email");
                data.token=localStorage.getItem("token");
                console.log(data);
                  $http({
                    url: $rootScope.globalServerUrl+"/main/hit",
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    data: "data="+JSON.stringify(data)
                  }).success(function(data){
                      readyState=true;
                      $state.go('tabs.home');
                  });
               }
              });
      },$scope.minPlayingTime*1000);
    };

    init();
  }
  else{
   
	if(device.platform==="Android"){  
	 $scope.video="false";
		alert(device.platform);
		var mytimeout = $timeout($scope.onTimeout,1000);
		VideoPlayer.play("http://html5demos.com/assets/dizzy.mp4");
		
		
	}
	else{   //not andoid
	  $scope.video="true";
	  $scope.source = $sce.trustAsResourceUrl(HomeService.getVideoUrl());
      $timeout(function() { 

        var video = document.getElementById("vid");
          video.addEventListener('click',function(){
              video.play();
               var mytimeout = $timeout($scope.onTimeout,1000);
          },false);

        
        video.addEventListener("pause", function(){
            if($scope.counter>=$scope.minPlayingTime){
                $timeout.cancel(mytimeout);
                $scope.counter=0;
              
              video.remove();

              var adUrl=$rootScope.globalServerUrl+"/main/getAdQuestion/";
              $http.get(adUrl+$scope.mediaId).then(function(response){
              
               $scope.questions=response.data.question;
               $scope.answer=response.data.answers;
               $scope.click=function(id){
                data.ad=$scope.mediaId;
                data.answer=id;
                data.email=localStorage.getItem("email");
                data.token=localStorage.getItem("token");
                console.log(data);
                  $http({
                    url: $rootScope.globalServerUrl+"/main/hit",
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    data: "data="+JSON.stringify(data)
                  }).success(function(data){
                      readyState=true;
                      $state.go('tabs.home');
                  });
               }
              });
            }
            else{
               $timeout.cancel(mytimeout);
            }
           
        }, false);



      },500);
	  }

 };

    $scope.$on('$locationChangeStart', function (event, next, current) {
       //console.log(readyState);
        if (!readyState) {
          event.preventDefault();
        }

    });
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
      return videoUrl.type;
    },
    getMediaDuration: function(){
      return videoUrl.duration;
    },
    getMediaId: function(){
      return videoUrl.id;
    }
  };
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
});
