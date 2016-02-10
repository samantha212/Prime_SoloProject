var mainApp=angular.module("mainApp",["ngRoute"]);mainApp.config(["$routeProvider","$locationProvider",function(a,b){a.when("/addsong",{templateUrl:"views/routes/add_song.html",controller:"AddSongController"}).when("/customlibrary",{templateUrl:"views/routes/library_custom.html",controller:"CustomLibraryController"}).when("/standardlibrary",{templateUrl:"views/routes/library_standard.html",controller:"StandardLibraryController"}).when("/refreshstandardlibrary",{templateUrl:"views/routes/library_standard.html",controller:"StandardLibraryController"}).when("/setlist",{templateUrl:"views/routes/set_list.html",controller:"SetListController"}).when("/songfail",{templateUrl:"views/routes/song_fail.html",controller:"SongFailController"}).when("/songsuccess",{templateUrl:"views/routes/song_success.html",controller:"SongSuccessController"}).otherwise({templateUrl:"views/routes/welcome.html",controller:"WelcomeController"}),b.html5Mode({enabled:!0,requireBase:!1})}]),mainApp.controller("MainController",function(){}),mainApp.controller("WelcomeController",function(){}),mainApp.controller("AddSongController",["$http","$location","$scope",function(a,b,c){function d(){a({url:"/addsong",method:"POST",data:c.song}).then(function(a){console.log(a),b.path("/songsuccess")},function(a){console.log("Error",a.status),b.path("/songfail")})}c.song={},c.addSong=d;var e=b.absUrl(),f=e+"/songsuccess";console.log(e),console.log(f)}]),mainApp.controller("CustomLibraryController",["$http","$scope",function(a,b){function c(){a({method:"GET",url:"/custom_lib"}).then(function(a){console.log(a),b.customLibrary=a.data},function(a){console.log("Error",a.status)})}b.customLibrary=[],b.getCustom=c}]),mainApp.controller("StandardLibraryController",["$http","$scope","$location","$route","$routeParams",function(a,b,c,d,e){function f(b){console.log("deactivate",b.song_id),a({method:"POST",url:"/deactivate",data:b}).then(function(a){console.log(a)},function(a){console.log("Error",a.status)})}function g(b){console.log("activate",b.song_id),a({method:"POST",url:"/activate",data:b}).then(function(a){console.log(a)},function(a){console.log("Error",a.status)})}function h(){a({method:"GET",url:"/standard_lib"}).then(function(a){console.log(a),b.libraryActive=a.data.active,b.libraryInactive=a.data.inactive,i(a.data.active),i(a.data.inactive)},function(a){console.log("Error",a)})}function i(a){for(var c=0;c<a.length;c++){var d=a[c].song_id;b.songStatus[d]=a[c].status}console.log(b.songStatus)}b.libraryActive=[],b.libraryInactive=[],b.checkbox={},b.songStatus={},b.deactivateSong=function(a){var c=a.song_id;1==b.songStatus[c]?(f(a),b.songStatus[c]=!1):(g(a),b.songStatus[c]=!0)},b.activateSong=function(a){var c=a.song_id;0==b.songStatus[c]?(g(a),b.songStatus[c]=!0):(b.deactivateSong(a),b.songStatus[c]=!1)},b.getStandard=function(){h()}}]),mainApp.controller("SetListController",["$scope","$http",function(a,b){a.setInfo={numSets:"",numSongs:""},a.getSets=function(){console.log(a.setInfo),b({method:"POST",url:"/getset",data:a.setInfo}).then(function(a){console.log(a)},function(a){console.log("Error",a)})}}]),mainApp.controller("SongFailController",function(){}),mainApp.controller("SongSuccessController",function(){});