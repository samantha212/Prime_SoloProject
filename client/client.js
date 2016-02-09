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

mainApp.controller('AddSongController', ['$http', '$location', '$scope', function($http, $location, $scope) {
    $scope.song = {};
    $scope.addSong = sendSong;
    //Do I need to send "/songsuccess", "addsong/songsuccess", or "http://localhost:3000/songsuccess" to go in the $location.path()??
    var currentLocation = $location.absUrl();
    var newLocation = currentLocation + ('/songsuccess');
    console.log(currentLocation);
    console.log(newLocation);
    function sendSong() {
        $http({
            url: '/addsong',
            method: 'POST',
            data: $scope.song
        }).then(function successCallback(response) {
            //$location.path(newLocation);
            console.log(response);
            //$location.path(newLocation);
            $location.path('/songsuccess');
        }, function errorCallback(response) {
            console.log('Error', response.status);
            $location.path('/songfail');

        });
    }

    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
}]);

mainApp.controller('CustomLibraryController', ['$http', '$scope', function($http, $scope) {
    $scope.customLibrary = [];

    $scope.getCustom = getCustomLib;

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

mainApp.controller('StandardLibraryController', ['$http', '$scope', '$location', function($http, $scope, $location) {

    $scope.library = [];
    $scope.checkbox = {};
    $scope.songStatus = {};

    $scope.deactivateSong = function(info) {
        var thisSongId = info.song_id;
        if($scope.songStatus[thisSongId] == true){
            deactivateOnDB(info);
            $scope.songStatus[thisSongId] = false;
        } else {
            activateOnDB(info);
            $scope.songStatus[thisSongId] = true;
        }
    };

    function deactivateOnDB(info) {
        console.log("deactivate", info.song_id);
        $http({
            method: 'POST',
            url: '/deactivate',
            data: info
        }).then(function successCallback(response){
            console.log(response);
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }


    $scope.activateSong = function(info){
        var thisSongId = info.song_id;
        if($scope.songStatus[thisSongId] == false){
            activateOnDB(info);
            $scope.songStatus[thisSongId] = true;
        } else {
            $scope.deactivateSong(info);
            $scope.songStatus[thisSongId] = false;
        }
    };

    function activateOnDB(info) {
        console.log("activate", info.song_id);
        $http({
            method: 'POST',
            url: '/activate',
            data: info
        }).then(function successCallback(response){
            console.log(response);
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });

    };
    $scope.getStandard = function() {
        getLib().then(populateSongStatus($scope.library));
    };

    function getLib(){
        $http({
            method: 'GET',
            url: '/standard_lib'
        }).then(function successCallback(response){
            console.log(response);
            //$scope.library = response.data;
            setLibArray(response);
        }, function errorCallback(response) {
            console.log('Error', response);
        });
    }

    function setLibArray(response){
        $scope.library = response.data;
        populateSongStatus($scope.library);
    }
    function populateSongStatus(array){
        for (var i=0; i<array.length; i++){
            //var thisId = "array[" + i + "].song_id";
            var songId = array[i].song_id;
            //var thisStatus = "array[" + i + "].status";
            $scope.songStatus[songId] = array[i].status;

        }
        console.log($scope.songStatus);
    };

}]);

mainApp.controller('SetListController', function() {

});

mainApp.controller('SongFailController', function() {

});

mainApp.controller('SongSuccessController', function() {

});
