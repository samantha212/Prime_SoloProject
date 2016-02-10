var express = require('express');
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var router = express.Router();
var connectionString = 'postgres://localhost:5432/song_shaker';
var userActiveSongs = [];

pg.defaults.poolsize = 30;

router.post('/', function(request, response) {
    console.log('/getset get route hit');

    //var userActiveSongs = [];

    console.log(request.body);

    pg.connect(connectionString, function (err, client, done) {

        var activeStandardsQuery = client.query("SELECT standard_library.artist, standard_library.title, standard_library.key, standard_library.tempo FROM standard_library \
        INNER JOIN user_standard_preferences\
        ON user_standard_preferences.song_id = standard_library.song_id\
        WHERE " + request.user.username + "=TRUE;");

        var getActiveCustoms = function(){
            var queryActiveCustoms = client.query("SELECT title, artist, key, tempo FROM user_custom_pref\
            WHERE (user_id = '" + request.user.user_id + "' AND include = TRUE);");

            console.log("active customs function hit");
            queryActiveCustoms.on('row', function (row) {
                userActiveSongs.push(row);
            });

            queryActiveCustoms.on('end', function(){
                client.end();
                var createdSetList = createSets(request.body.numSets, request.body.numSongs);
                return response.send("Created Set List:", createdSetList);
            });
        };

        activeStandardsQuery.on('row', function (row) {
            userActiveSongs.push(row);
        });

        activeStandardsQuery.on('end', function(){
            getActiveCustoms();
            //client.end();
            //console.log(userActiveSongs);
        });

        if (err) {
            console.log('Error', err);
            return response.send('Error', err);
        }
    });

    pg.end();

});


function createSets(setsNum, songsNum){
    var setsNumber = parseInt(setsNum);
    var songsNumber = parseInt(songsNum);

    var setList = [];

    for (i=0; i<setsNumber; i++){
        var setHolder = {
            name: "set" + (i + 1),
            songs: []
        };
        var songsHolder = [];
        console.log("we're on set", i);
        for (j=0; j<songsNumber; j++){
            console.log("we're on song", j);
            var selectedNumber = randomNumber(0, userActiveSongs.length);
            var selectedSong = userActiveSongs[selectedNumber];
            songsHolder.push(selectedSong);
            //console.log(songsHolder);
        }
        setHolder.songs = songsHolder;
        //console.log(setHolder);

        setList.push(setHolder);
    }
    console.log(setList);
    return setList;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
}




module.exports = router;