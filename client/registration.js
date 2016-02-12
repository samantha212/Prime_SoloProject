/**
 * Created by samanthamusselman on 2/3/16.
 */

var registrationApp = angular.module('registrationApp', []);

registrationApp.controller('registrationController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.user = {};
    $scope.failStatus = false;
    $scope.userDuplicate = false;
    $scope.registerUser = sendInfo;

    function sendInfo() {
        $http({
            url: '/registration',
            method: 'POST',
            data: $scope.user
        }).then(function successCallback(response){
                console.log('Response', response);
                var currentLocation = window.location.href;
                var newLocation = currentLocation + "/login";
                window.location.assign(newLocation);
        }, function errorCallback(response) {
            console.log('Error', response.status);
            if (response.status == 510) {
                $scope.userDuplicate = true
            } else {
                $scope.failStatus = true;
            }
        });
    }

}]);

