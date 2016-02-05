
var indexApp = angular.module('indexApp', []);

indexApp.controller('ButtonController', ['$scope', '$http', function($scope, $http){

    $scope.goToRegistration = function () {
        console.log('Registration button clicked');
        window.location.assign('http://localhost:3000/registration');
    }

    $scope.goToLogIn = function() {
        window.location.assign('http://localhost:3000');
    }
}]);


