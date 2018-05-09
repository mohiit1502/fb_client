'use strict';

angular.module('ngSocial.facebook', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/facebook', {
    templateUrl: 'facebook/facebook.html',
    controller: 'FacebookCtrl'
  });
}])
.controller('FacebookCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.isLoggedIn = false;

	$scope.login = function(){
	    var username = $scope.username
	    var password = $scope.password
	    $http({
            url: 'http://127.0.0.1:5003/app/authenticate',
            method: "GET",
            params: {
                username: username,
                password: password
            }
         }).then(function(response) {
            if(response) {
                $scope.isLoggedIn = true;
                var _id = JSON.parse(response.data)['_id']
                $scope.refresh(_id);
		    }
        }, function(response, status) {
           $scope.error = response.data.error
        });
	}

	$scope.logout = function(){
		//$facebook.logout().then(function(){
			$scope.isLoggedIn = false;
			$scope.refresh();
		//});
	}

	$scope.refresh = function(_id){
	    if($scope.isLoggedIn) {
            $http({
                url: 'http://127.0.0.1:5003/app/getUserInfo',
                method: "GET",
                params: {
                    '_id': _id
                }
            }).then(function(response) {
                if(response) {
                    var responseData = JSON.parse(response.data)
                    $scope.userInfo = responseData
                }
            }, function(response) {
                if(respnose && response.data)
                    $scope.error = response.data.error
            });
		}
		
	}

	$scope.postStatus = function(){
		var body = this.body;
		$facebook.api('/me/feed', 'post', {message: body}).then(function(response){
			$scope.msg = 'Thanks for Posting';
			$scope.refresh();
		});
	}

	$scope.refresh();
}]);