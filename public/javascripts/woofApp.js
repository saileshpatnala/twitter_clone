var app = angular.module('woofApp', ['ngRoute']).run(function($http, $rootScope){
  $rootScope.authenticated = false;
  $rootScope.currentUser = ' ';

  $rootScope.logout = function(){
    $http.get('/auth/signout')
    $rootScope.authenticated = false;
    $rootScope.currentUser = ' ';
  }
});

app.config(function($routeProvider){
  $routeProvider
    // the timeline display
    .when('/', {
      templateUrl: 'main.html',
      controller: 'mainController'
    })
    // the login display
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'authController'
    })
    // the signup display
    .when('/signup', {
      templateUrl: 'register.html',
      controller: 'authController'
    });
});

app.factory('postService', function($http){
  var factory = {};
  factory.getAll = function() {
    return $http.get('/api/posts');
  };
  return factory;
})

app.controller('mainController', function($scope, postService){
  $scope.posts = [];
  $scope.newPost = {created_by: '', text: '', created_at: ''};

  postService.getAll().success(function(data){
    $scope.posts = data;
  });

  $scope.post = function(){
    $scope.newPost.created_at = Date.now();
    $scope.posts.push($scope.newPost);
    $scope.newPost = {created_by: '', text: '', created_at: ''};
  };
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function() {
    $http.post('/auth/login', $scope.user).success(function(data){
      if (data.state === 'success'){
        $rootScope.authenticated = true;
        $rootScope.currentUser = data.user.username;
        $location.path('/');
      }
      else {
        $scope.error_message = data.message;
      }
    })
  };

  $scope.register = function() {
    $http.post('/auth/signup', $scope.user).success(function(data){
      if (data.state === 'success'){
        $rootScope.authenticated = true;
        $rootScope.currentUser = data.user.username;
        $location.path('/');
      }
      else {
        $scope.error_message = data.message;
      }
    })
  };
});
