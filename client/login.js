var app = angular.module('indexApp', []);

app.controller('ButtonController', ['$scope', '$http', '$location', function($scope, $http, $location){

    $scope.goToRegistration = function () {
        console.log('Registration button clicked');
        window.location.assign('http://localhost:3000/registration');
    };

    $scope.goToLogIn = function() {
        window.location.assign('http://localhost:3000');
    };
}]);



