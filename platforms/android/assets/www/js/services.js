angular.module('ads',[])
.service('SendFirst', function($http){
         this.SendData=function(){
         return $http({
                      method: "GET",
                      url:""
         })
         }
        });