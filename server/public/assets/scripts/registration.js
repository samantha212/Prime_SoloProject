/**
 * Created by samanthamusselman on 2/3/16.
 */

var registrationApp = angular.module('registrationApp', []);

registrationApp.controller('registrationController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.user = {};

    $scope.registerUser = sendInfo;

    function sendInfo() {
        $http({
            url: '/registration',
            method: 'POST',
            data: $scope.user
        }).then(function successCallback(response){
                console.log('Response', response);
                window.location.assign('http://localhost:3000/');
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }



}]);