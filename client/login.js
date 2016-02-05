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


// Potential factory (to be moved to separate file if used).
//
//app.factory('userData', ['$http', function($http){
//    var currentUser = {
//        user_id: '',
//        first_name: '',
//        last_name: '',
//        email_address: '',
//        username: '',
//        password: ''
//    };
//
//    var setUser = function() {
//        currentUser.username = username;
//        console.log("currentUser.username set:", currentUser.username);
//    };
//
//    return {
//        currentUser: currentUser,
//        setUser: setUser
//    }
//}]);
