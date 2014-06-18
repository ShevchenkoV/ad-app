angular.module('ads', ['ionic', 'openfb'])

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


.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
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
               templateUrl: "home-selected.html"

               
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
               templateUrl: "profile.html"
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
        (data.login==="true")?$state.go('tabs.home'):$state.go('signin');
    });

              };
            })
           

.controller('HomeTabCtrl', function($scope, $http) {
            
            })

.controller('FacebookTabCtrl', function($scope, $http) {
            console.log('FacebookTabCtrl');
            var ref = window.open('http://facebook.com', '_blank', 'location=yes');
            ref.addEventListener('loadstart', function() { alert(event.url); });
            })

.controller('RegistrationCtrl', function($scope, $http,$location,IdService) {
            var x;
            $scope.user={};
            $scope.id;
            $scope.checkEmail=function(){
                var url='http://77.121.81.147/profile/checkEmail/';
                var check=encodeURIComponent('{"email":"'+$scope.user.email +'"}');

            var emailCheck=$http({method:"GET",url:url+check})
            .success(function(data){ if(data.checkEmail==="false"){x=0;} else {x=1;} });

            };
            
            $scope.submit=function(){
            
                        var data=encodeURIComponent(JSON.stringify($scope.user));
                        var url='http://77.121.81.147/profile/registrationFirstStep/';
                        if(!x){console.log('Current email already taken');}
                        else{
                            $http.get(url+data).success(function(data){
                              IdService.setId(data.id);}
                              );
                            $location.path('/registration2');
                            console.log(IdService.setId(data.id));}
                            }
                
            })

.controller('Registration2Ctrl', function($scope, $http, IdService ,$state) {
            $scope.user={};
            $scope.user.id=3;
            var id;
            id=IdService.getId();
            $scope.submit=function(){
            var data=encodeURIComponent(JSON.stringify($scope.user));
            var url='http://77.121.81.147/profile/registrationSecondStep/';
            $http.get(url+data);
            $state.go('tabs.home');
            }
            
            
            })
.service('IdService', function(){
         var id=[];
         
         return {
            getId:function(){
                return id;
            },
            setId:function(data){
                id.push(data);
            }
         };
         });

