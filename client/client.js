/**
 * Created by samanthamusselman on 2/4/16.
 */

var mainApp = angular.module('mainApp', ['ngRoute']);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
        .when('/addsong', {
            templateUrl: 'views/routes/add_song.html',
            controller: "AddSongController"
        })
        .when('/customlibrary', {
            templateUrl: 'views/routes/library_custom.html',
            controller: "CustomLibraryController"
        })
        .when('/standardlibrary', {
            templateUrl: 'views/routes/library_standard.html',
            controller: "StandardLibraryController"
        })
        .when('/setlist', {
            templateUrl: 'views/routes/set_list.html',
            controller: "SetListController"
        })
        .when('/songfail', {
            templateUrl: 'views/routes/song_fail.html',
            controller: "SongFailController"
        })
        .when('/songsuccess', {
            templateUrl: 'views/routes/song_success.html',
            controller: "SongSuccessController"
        })
        .otherwise( {
            templateUrl: 'views/routes/welcome.html',
            controller: "WelcomeController"
        });



    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);


mainApp.controller('MainController', function() {

});

mainApp.controller('WelcomeController', function() {

});

mainApp.controller('AddSongController', function() {

});

mainApp.controller('CustomLibraryController', ['$http', '$scope', function($http, $scope) {
    $scope.customLibrary = [];

    getCustomLib();

    //This runs twice when the page is loaded.  Revisit to address.
    function getCustomLib(){
        $http({
            method: 'GET',
            url: '/custom_lib'
        }).then(function successCallback(response){
            console.log(response);
            $scope.customLibrary = response.data;
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }

}]);

mainApp.controller('StandardLibraryController', ['$http', '$scope', function($http, $scope) {

    $scope.library = [];

    getLib();

    //This runs twice when the page is loaded.  Revisit to address.


    function getLib(){
        $http({
            method: 'GET',
            url: '/standard_lib'
        }).then(function successCallback(response){
            console.log(response);
            $scope.library = response.data;
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }

}]);

mainApp.controller('SetListController', function() {

});

mainApp.controller('SongFailController', function() {

});

mainApp.controller('SongSuccessController', function() {

});
