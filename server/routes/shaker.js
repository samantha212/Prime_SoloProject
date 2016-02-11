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
            var queryActiveCustoms = client.query("SELECT artist, title, key, tempo FROM user_custom_pref\
            WHERE (user_id = '" + request.user.user_id + "' AND include = TRUE);");

            console.log("active customs function hit");
            queryActiveCustoms.on('row', function (row) {
                userActiveSongs.push(row);
            });

            queryActiveCustoms.on('end', function(){
                client.end();
                var createdSetList = createSets(request.body.numSets, request.body.numSongs);
                return response.send(createdSetList);
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


function createSets(sets, songs) {
    var setsNumber = parseInt(sets);
    var songsNumber = parseInt(songs);

    var setList = [];

    for (i = 0; i < setsNumber; i++) {
        var setHolder = {
            name: "Set #" + (i + 1),
            songs: []
        };
        var songsHolder = [];
        console.log("we're on set", i);
        while (songsHolder.length < songsNumber) {
            console.log("We're trying another song!");
            var selectedNumber = randomNumber(0, (userActiveSongs.length - 1));
            var selectedSong = userActiveSongs[selectedNumber];
            console.log(selectedSong);
            //if slot is 1, song is category fast, push
            if (songsHolder.length < 1) {
                if (selectedSong.tempo == "Fast") {
                    //break out into separate function.
                    songsHolder.push(selectedSong);
                    userActiveSongs.splice(selectedNumber, 1);
                }
            } else {
                var duplicateArtist = false;
                console.log("checking duplicates");
                for (var j = 0; j < songsHolder.length; j++) {
                    console.log("checking", j);
                    if (selectedSong.artist == songsHolder[j].artist) {
                        duplicateArtist = true;
                    }
                }
                if (duplicateArtist == false) {
                    var previousSongIndex = songsHolder.length - 1;
                    var secondPreviousSongIndex = songsHolder.length - 2;
                    var thirdPreviousSongIndex = songsHolder.length - 3;
                    var fourthPreviousSongIndex = songsHolder.length - 4;

                    if (songsHolder.length < 2) {
                        useSong();
                    } else if (songsHolder.length < 4) {
                        if (selectedSong.key == songsHolder[previousSongIndex].key && selectedSong.key == songsHolder[secondPreviousSongIndex].key) {
                            console.log("Can't use song - three of same key in a row.");
                        } else {
                            if (selectedSong.tempo == "Slow") {
                                console.log("the song tempo is slow");
                                if (songsHolder[previousSongIndex].tempo == "Slow" && songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[secondPreviousSongIndex].tempo == "Slow") {
                                    console.log("too many slows - can't use");
                                } else {
                                    useSong();
                                }
                            } else {
                                useSong();
                            }
                        }
                    } else {
                        console.log("Route songs.length 4+ hit");
                        if (selectedSong.key == songsHolder[previousSongIndex].key && selectedSong.key == songsHolder[secondPreviousSongIndex].key) {
                            console.log("Can't use song - three of same key in a row.");
                        } else {
                            console.log("The key is okay, continuing with logic");
                            if (songsHolder.length == (songsNumber - 1)) {
                                console.log("We're on the last song!");
                                if (selectedSong.tempo == "Fast") {
                                    useSong();
                                } else {
                                    console.log("Can't use for last song - too slow");
                                }
                            } else {
                                console.log("We are not yet on the last song");
                                if (selectedSong.tempo == "Slow") {
                                    console.log("tempo is slow");
                                    if (songsHolder[previousSongIndex].tempo == "Slow" && songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[thirdPreviousSongIndex].tempo == "Slow") {
                                        console.log("too many slows - can't use");
                                    } else {
                                        useSong();
                                    }
                                } else {
                                    //useSong();
                                    console.log("tempo is med or fast");
                                    if (songsHolder.length == (songsNumber - 2)) {
                                        console.log("we are on the 2nd to last song");
                                        if (songsHolder[previousSongIndex].tempo != "Slow" && songsHolder[secondPreviousSongIndex].tempo != "Slow" && songsHolder[thirdPreviousSongIndex].tempo != "Slow") {
                                            console.log("too many fasts");
                                        } else {
                                            useSong();
                                        }
                                    } else {
                                        console.log("we are somewhere in the middle");
                                        if (songsHolder[previousSongIndex].tempo != "Slow" && songsHolder[secondPreviousSongIndex].tempo != "Slow" && songsHolder[thirdPreviousSongIndex].tempo != "Slow" && songsHolder[fourthPreviousSongIndex].tempo != "Slow") {
                                            console.log("too many fasts");
                                        } else {
                                            useSong();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    setHolder.songs = songsHolder;
    console.log("setHolder is set for this set.");
    setList.push(setHolder);
    }
        console.log(setList);
        return setList;
//    add a error that returns if there are fewer than 150 songs.  Something to trigger indication on DOM.
    function useSong() {
        songsHolder.push(selectedSong);
        userActiveSongs.splice(selectedNumber, 1);
    }
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (1 + max - min) + min);
    }
}

module.exports = router;