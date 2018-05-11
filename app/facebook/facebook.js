'use strict';

angular.module('ngSocial.facebook', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/facebook', {
    templateUrl: 'facebook/facebook.html',
    controller: 'FacebookCtrl'
  }).when('/login', {
     templateUrl: 'facebook/facebook.html',
     controller: 'LoginCtrl'
  });
}])
.service('refreshService', ['$http', function($http){
    self = this;
    var l2Response = {}

    this.refresh = function(_id, callback){
        if(this.isLoggedIn) {
            $http({
                url: 'http://127.0.0.1:5003/app/getUserInfo',
                method: "GET",
                params: {
                    '_id': _id
                }
            }).then(function(response) {
                if(response) {
                    var responseData = JSON.parse(response.data)
                    l2Response.welcomeMsg = "Welcome "+ responseData.first_name;
                    l2Response.userInfo = responseData;
                    l2Response.picture = l2Response.userInfo ? (l2Response.userInfo.image_url ? l2Response.userInfo.image_url : '') : '';
                    l2Response.posts = l2Response.userInfo ? (l2Response.userInfo.posts ? l2Response.userInfo.posts : []) : [];
                    callback(l2Response);
                }
            }, function(response) {
                if(response && response.data) {
                    l2Response.error = response.data.error;
                    callback(l2Response);
                }
            });
        }
    }
}])
.controller('LoginCtrl', ['$scope', '$http', '$window', 'refreshService', function($scope, $http, $window, refreshService) {
    $scope.connector = refreshService;
    $scope.isLoggedIn = refreshService.isLoggedIn ? refreshService.isLoggedIn : false;
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
                var _id = JSON.parse(response.data)['_id']
                $scope.connector.id = _id
                $scope.connector.isLoggedIn = true;
                $scope.isLoggedIn = true;
               // $scope.userData = refreshService.refresh(refreshService.id);
                $window.location.href = '/app/#/facebook';
		    }
        }, function(response) {
            if(response && response.data)
                $scope.connector.error = response.data.error
        });
	}

	$scope.logout = function(){
		//$facebook.logout().then(function(){
			$scope.connector.isLoggedIn = false;
			$scope.isLoggedIn = refreshService.isLoggedIn ? refreshService.isLoggedIn : false;
			$scope.userData = refreshService.refresh(refreshService.id);
		//});
	}
}])
.controller('FacebookCtrl', ['$scope', '$http', 'refreshService', function($scope, $http, refreshService) {
    self = this;
    $scope.connector = refreshService;
    $scope.isLoggedIn = $scope.connector.isLoggedIn;
	$scope.postStatus = function(){
		if($scope.isLoggedIn) {
		    var post = $scope.body;
		    var _id = $scope.connector.id;
            $http({
                url: 'http://127.0.0.1:5003/app/feed',
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                data: "post="+ post+"&_id="+_id
            }).then(function(response) {
                if(response) {
                    $scope.userData.msg = JSON.parse(response.data)['msg'];
                }
                self.refresh()
            }, function(response) {
                if(response && response.data)
                    $scope.error = response.data.error
            });
		}
	}

    self.refresh = function() {
        $scope.connector.refresh($scope.connector.id, function(data) {
            $scope.userData = data;
        });
    }

    self.refresh();
}]);