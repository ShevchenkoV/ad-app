angular.module('ads', ['ionic', 'openfb', 'ngResource'])

.run(function ($rootScope, $state, $ionicPlatform, $window, OpenFB) {

        OpenFB.init('803761662981098');

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

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


.config(function($stateProvider, $urlRouterProvider, $httpProvider, $sceProvider) {
        var id;
                $httpProvider.defaults.useXDomain = true;
    $stateProvider
        .state('signin', {
               url: "/sign-in",
               templateUrl: "sign-in.html",
               controller: 'SignInCtrl'
               })
        .state('forgotpassword', {
               url: "/forgot-password",
               templateUrl: "forgot-password.html"
               })
        .state('registration', {
               url: "/registration",
               templateUrl: "registration.html",
               controller: "RegistrationCtrl"
               })
        .state('registration2', {
               url: "/registration2",
               templateUrl: "registration2.html",
               controller: "Registration2Ctrl"
               })
        .state('homeselected', {
               url: "/home-selected",
               templateUrl: "home-selected.html",
               controller: "HomeSelectedCtrl"               
               })
        .state('selectedvideo', {
               url: "/selected-video",
               templateUrl: "selected-video.html",
               controller: "SelectedVideoCtrl"               
               })
        .state('tabs', {
               url: "/tab",
               abstract: true,
               templateUrl: "tabs.html"
               })
        .state('tabs.home', {
               url: "/home",
               views: {
               'home-tab': {
               templateUrl: "home.html",
               controller: 'HomeTabCtrl'
               }
               }
               })

        .state('tabs.profile', {
               url: "/profile",
               views: {
               'profile-tab': {
               templateUrl: "profile.html",
               controller: "ProfileTabCtrl"
               }
               }
               })
        .state('tabs.facebook', {
               url: "/facebook",
               views: {
               'facebook-tab': {
               templateUrl: "facebook.html",
               controller: "FacebookTabCtrl"
               }
               }
               })
        .state('tabs.settings', {
               url: "/settings",
               views: {
               'settings-tab': {
               templateUrl: "settings.html"
               }
               }
               })

        .state('tabs.contact', {
               url: "/contact",
               views: {
               'contact-tab': {
               templateUrl: "contact.html"
               }
               }
               });
        
        
        $urlRouterProvider.otherwise("/sign-in");
        
        })

.controller('SignInCtrl', function($scope, $state, OpenFB,$http) {
            $scope.user={};       
            $scope.word=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
            $scope.user.remember="false";

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
              var url='http://77.121.81.147/profile/login/';
              var data=encodeURIComponent(JSON.stringify($scope.user));

              $http({
                  url: "http://77.121.81.147/profile/login",
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: 'data='+data
                }).success(function(data) {
                  if(data.login==="true"){
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("token", data.token);
                     $state.go('tabs.home');
                  }
                  else{
                    $state.go('signin');
                  }                    
                });
              };
            })
           

.controller('HomeTabCtrl', function($scope, $http, HomeService, $state,$resource) {
    $scope.category={};
    var data={};
    data.token=localStorage.getItem("token");
    data.email=localStorage.getItem("email");

       $http({
          url: "http://77.121.81.147/main/getAdCategories",
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
          data: "data="+JSON.stringify(data)
        }).success(function(data){
          $scope.category=data;
        });
       // $scope.category=HomeService.getHomeCategories();  MOCKDATA

        $scope.getCategoryVideos=function(id){
              $scope.videoThumbUrl="http://77.121.81.147/public/video/thumb/";
              $scope.videoUrl="http://77.121.81.147/public/video/";
              
              $scope.imageThumbUrl="http://77.121.81.147/public/picture/thumb/";
              $scope.imageUrl="http://77.121.81.147/public/picture/";

          var Videos = $resource('http://77.121.81.147/main/getAdByCategory/:catId/9');
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
           //console.log(videoList);
       }
   })

.controller('ProfileTabCtrl', function($scope, $http, ProfileSaveService,$q) {
            var data={};
            $scope.user={};
            data.token=localStorage.getItem("token");
            data.email=localStorage.getItem("email");

             /* $http({method:"GET",url:'http://77.121.81.147/tag/getCountries'})   //ready
              .success(function(data){
                $scope.CountryList=data; 
                       $scope.user.country=$scope.CountryList[$scope.userData[0].country];
              }); 

            $http({method:"GET",url:'http://77.121.81.147/tag/getEducations'})   //ready
              .success(function(data){
                $scope.EducationList=data; 
              }); 

            $http({method:"GET",url:'http://77.121.81.147/tag/getSex'})   //ready
              .success(function(data){
                $scope.SexList=data; 
              }); 
             $http({
                  url: "http://77.121.81.147/profile/getProfile",
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: "data="+JSON.stringify(data)
              }).success(function(data){
                

                $scope.userData=data;
                console.log($scope.userData[0].country);
              });*/
              $scope.CountryList = $http({method:"GET",url:'http://77.121.81.147/tag/getCountries'}) ;
              $scope.EducationList = $http({method:"GET",url:'http://77.121.81.147/tag/getEducations'});
              $scope.SexList = $http({method:"GET",url:'http://77.121.81.147/tag/getSex'});
              $scope.userData = $http({
                  url: "http://77.121.81.147/profile/getProfile",
                  method: "POST",
                  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                  data: "data="+JSON.stringify(data)
              });
$q.all([$scope.CountryList, $scope.EducationList, $scope.SexList, $scope.userData]).then(function(res) {
    
    $scope.CountryList=res[0].data;
    $scope.EducationList=res[1].data;
    $scope.SexList=res[2].data;
    $scope.userData=res[3].data;
    console.log($scope.userData[0]);
    $scope.user.country=$scope.CountryList[$scope.userData[0].country-1];
    $scope.user.education=$scope.EducationList[$scope.userData[0].education-1];
    $scope.user.sex=$scope.SexList[$scope.userData[0].sex];
    $scope.user.first_name=$scope.userData[0].first_name;
    $scope.user.last_name=$scope.userData[0].last_name;
    //$scope.userData[0].birthday;

});

              /*

              $scope.user={};
              $scope.userData=ProfileSaveService.getMockUserDetails("mockUser");     MOCKDATA
              $scope.CountryList= ProfileSaveService.getMockCountries();
              $scope.EducationList=ProfileSaveService.getMockEducation();
              $scope.SexList=ProfileSaveService.getMockSex(); 
              $scope.fill=function(){
                console.log($scope.user.country);
                console.log($scope.userData.country);
              }; */

            })

.controller('FacebookTabCtrl', function($scope, $http) {
            var ref = window.open('http://facebook.com', '_blank', 'location=yes');
            ref.addEventListener('loadstart', function() { alert(event.url); });
            })

.controller('RegistrationCtrl', function($scope, $http,$location,IdService) {
            var x;
            $scope.user={};
            $scope.wordPattern=/^[a-zA-Z0-9]+$/; //password regexp
            $scope.namePattern=/^[a-zA-Z]+$/;
            $scope.emailPattern=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
            $scope.id;
            $scope.checkEmail=function(){
                var url='http://77.121.81.147/profile/checkEmail/';
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
                        var url='http://77.121.81.147/profile/registrationFirstStep/';
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

.controller('Registration2Ctrl', function($scope, $http, IdService ,ProfileSaveService, $state) {
            $scope.user={};
            $http({method:"GET",url:'http://77.121.81.147/tag/getCountries'})   //ready
              .success(function(data){
                $scope.CountryList=data; 
              }); 

            $http({method:"GET",url:'http://77.121.81.147/tag/getEducations'})   //ready
              .success(function(data){
                $scope.EducationList=data; 
              }); 

            $http({method:"GET",url:'http://77.121.81.147/tag/getSex'})   //ready
              .success(function(data){
                $scope.SexList=data; 
              }); 
             //$scope.CountryList=ProfileSaveService.getMockCountries();       
             //$scope.EducationList = ProfileSaveService.getMockEducation(); 
             //$scope.SexList = ProfileSaveService.getMockSex();
            $scope.submit=function(){
                var req={};
                req.id=localStorage.getItem('id');
                req.country=$scope.user.country.id;
                req.birthday=$scope.user.date;
                req.education=$scope.user.education.id;
                req.sex=$scope.user.sex.id;
                req.skip="false";

              var data=encodeURIComponent(JSON.stringify(req));
              var url='http://77.121.81.147/profile/registrationSecondStep/';
              $http.get(url+data);
             // ProfileSaveService.setMockUserDetails($scope.user);  //mock
              $state.go('signin');
            } 
            $scope.skip=function(){
               var req={};
               req.id=localStorage.getItem('id');
               req.skip="true";
              var data=encodeURIComponent(JSON.stringify(req));
              var url='http://77.121.81.147/profile/registrationSecondStep/';
              $http.get(url+data);
              $state.go('signin');
            } ;       
})
.controller('HomeSelectedCtrl', function($scope,$ionicSlideBoxDelegate ,HomeService, $http, $state,$timeout){

    $scope.currentPage = 0;
    $scope.pageSize = 9;
    $scope.data = {};
    $timeout(function(){
      $scope.data=HomeService.getVideosList();
    },500)
  


  
    /*$http({method:"GET",url:'http://77.121.81.147/main/getVideosByCategory/1/9'})   //ready
              .success(function(data){
                data[0].thumbnail= $scope.thumbUrl+data[0].thumbnail;
                data[0].video= $scope.videoUrl+data[0].video;
                  $scope.data=data; 
                  console.log($scope.data);
              }); */
    //HomeService.getVideosList();
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

.controller('SelectedVideoCtrl', function($scope,HomeService, $timeout ,$sce){
if(HomeService.getMediaType()==="picture"){
  $scope.image="true";
  $scope.source=$sce.trustAsResourceUrl(HomeService.getVideoUrl());  
  console.log($scope.image);
}
else{
  $scope.video="true";
  $scope.source=$sce.trustAsResourceUrl(HomeService.getVideoUrl());
  console.log($scope.video);
}
/* $timeout(function(){
       $scope.source=$sce.trustAsResourceUrl(HomeService.getVideoUrl());   
  },500);*/
})

.service('ProfileSaveService', function($http){
  var profile={};
  var mockCountryList, mockSexList, mockEducationList=[];
  return {
    getMockCountries: function(){
      return mockCountryList=[
        {name:"Israel", id:"1"},
        {name:"France", id:"2"},
        {name:"Spain", id:"3"},
        {name:"Germany", id:"4"},
        {name:"England", id:"5"}];     
    },
    getMockEducation: function(){
      return mockEducationList=[
        {name:'School', id:'1'},
        {name:'High School', id:'2'},
        {name:'Bachelor', id:'3'},
        {name:'Doctor', id:'4'},
        {name:'Aspirant', id:'5'}
      ];
    },
    getMockSex: function(){
      return mockSexList=[
        {name:'Female', id:'0'},
        {name:'Male', id:'1'}
      ];
    },
    setMockUserDetails: function(data){
      localStorage.setItem("mockUser", JSON.stringify(data));
    },
    getMockUserDetails: function(name){
      return JSON.parse(localStorage.getItem(name));
    },
    getProfile: function(){
      return profile;
    },
    setProfile: function(data){
      profile=data;
    }
  };
})

.service('HomeService', function(){
  var videosList=[];
  var videoUrl="";

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
