/**
 * Created by samanthamusselman on 2/4/16.
 */

var mainApp = angular.module('mainApp', ['ngRoute']);

mainApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
        .when('/addSong', {
            templateUrl: 'views/routes/add_song.html',
            controller: "AddSongController"
        })
        .when('/customLibrary', {
            templateUrl: 'views/routes/library_custom.html',
            controller: "CustomLibraryController"
        })
        .when('/standardLibrary', {
            templateUrl: 'views/routes/library_standard.html',
            controller: "StandardLibraryController"
        })
        .when('/setList', {
            templateUrl: 'views/routes/set_list.html',
            controller: "SetListController"
        })
        .when('/songFail', {
            templateUrl: 'views/routes/song_fail.html',
            controller: "SongFailController"
        })
        .when('/songSuccess', {
            templateUrl: 'views/routes/song_success.html',
            controller: "SongSuccessController"
        })
        .otherwise( {
            templateUrl: 'views/routes/welcome.html'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);


mainApp.controller('MainController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.logOut = logUserOut;

    function logUserOut() {
        console.log("log out clicked");
        $http({
            url: '/logout',
            method: 'GET'
        }).then(function successCallback(response){
            window.location.assign($location.host());
        });
    }

}]);

mainApp.controller('AddSongController', ['$http', '$location', '$scope', function($http, $location, $scope) {
    $scope.song = {};
    $scope.addSong = sendSong;

    function sendSong() {
        $http({
            url: '/addSong',
            method: 'POST',
            data: $scope.song
        }).then(function successCallback(response) {
            console.log(response);
            $location.path('/songSuccess');
        }, function errorCallback(response) {
            console.log('Error', response.status);
            $location.path('/songFail');

        });
    }
}]);

mainApp.controller('CustomLibraryController', ['$http', '$scope', function($http, $scope) {
    $scope.customLibraryActive = [];
    $scope.customLibraryInactive = [];
    $scope.songStatus = {};

    $scope.getCustom = getCustomLib;

    function getCustomLib(){
        $http({
            method: 'GET',
            url: '/custom_lib'
        }).then(function successCallback(response){
            $scope.customLibraryActive = response.data.active;
            $scope.customLibraryInactive = response.data.inactive;
            populateSongStatus(response.data.active);
            populateSongStatus(response.data.inactive);
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }

    // Creates scope object to hold true/false values for song ids.
    // Use this to activate and deactivate on the database.
    function populateSongStatus(array){
        for (var i=0; i<array.length; i++){
            var songId = array[i].custom_song_id;
            $scope.songStatus[songId] = array[i].include;
        }
    }

    $scope.deactivateSong = function(info) {
        var thisSongId = info.custom_song_id;
        if($scope.songStatus[thisSongId] == true){
            deactivateOnDB(info);
            $scope.songStatus[thisSongId] = false;
        } else {
            activateOnDB(info);
            $scope.songStatus[thisSongId] = true;
        }
    };

    function deactivateOnDB(info) {
        console.log("deactivate", info.custom_song_id);
        $http({
            method: 'POST',
            url: '/deactivate_custom',
            data: info
        }).then(function successCallback(response){
            console.log(response);
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    }

    function activateOnDB(info) {
        $http({
            method: 'POST',
            url: '/activate_custom',
            data: info
        })
    }

    $scope.activateSong = function(info){
        var thisSongId = info.custom_song_id;
        if($scope.songStatus[thisSongId] == false){
            activateOnDB(info);
            $scope.songStatus[thisSongId] = true;
        } else {
            deactivateOnDB(info);
            $scope.songStatus[thisSongId] = false;
        }
    };

}]);

mainApp.controller('StandardLibraryController', ['$http', '$scope', function($http, $scope) {

    $scope.libraryActive = [];
    $scope.libraryInactive = [];
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
        $http({
            method: 'POST',
            url: '/deactivate',
            data: info
        }).then(function successCallback(response){
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
        $http({
            method: 'POST',
            url: '/activate',
            data: info
        }).then(function successCallback(response){
        }, function errorCallback(response) {
            console.log('Error', response.status);
        });
    };

    $scope.getStandard = function() {
        getLib();
    };

    function getLib(){
        $http({
            method: 'GET',
            url: '/standard_lib'
        }).then(function successCallback(response){
            $scope.libraryActive  = response.data.active;
            $scope.libraryInactive  = response.data.inactive;
            populateSongStatus(response.data.active);
            populateSongStatus(response.data.inactive);
        }, function errorCallback(response) {
            console.log('Error', response);
        });
    }

    function populateSongStatus(array){
        for (var i=0; i<array.length; i++){
            var songId = array[i].song_id;
            $scope.songStatus[songId] = array[i].status;
        }
    };

}]);

mainApp.controller('SetListController', ['$scope', '$http', function($scope, $http) {
    $scope.setInfo = {
        numSets: '',
        numSongs: ''
    };

    $scope.setResults = [];
    $scope.getSets = getLists;

    function getLists(setInfo) {
        console.log(setInfo);
        $http({
            method: 'POST',
            url: '/getset',
            data: setInfo
        }).then(function successCallback(response){
            console.log(response);
            $scope.setResults = response.data;
        }, function errorCallback(response) {
            console.log('Error', response);
        });
    }

}]);

mainApp.controller('SongFailController', function() {

});

mainApp.controller('SongSuccessController', function() {

});
