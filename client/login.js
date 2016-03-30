var app = angular.module('logInApp');

app.controller('ButtonController', ['$scope', function($scope){

    $scope.goToRegistration = function () {
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


