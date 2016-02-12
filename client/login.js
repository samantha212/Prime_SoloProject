var app = angular.module('indexApp', []);

app.controller('ButtonController', ['$scope', '$http', '$location', function($scope, $http, $location){

    $scope.goToRegistration = function () {
        console.log('Registration button clicked');
        var currentLocation = location.origin;
        var newLocation = currentLocation + "/registration";
        window.location.assign(newLocation);
    };

    $scope.goToLogIn = function() {
        var currentLocation = location.origin;
        var newLocation = currentLocation + "/login";
        window.location.assign(newLocation);
    };
}]);



