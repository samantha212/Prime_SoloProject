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
        while (songsHolder.length < songsNumber) {
            var selectedNumber = randomNumber(0, (userActiveSongs.length - 1));
            var selectedSong = userActiveSongs[selectedNumber];
            if (songsHolder.length < 1) {
                if (selectedSong.tempo == "Fast") {
                    useSong();
                }
            } else {
                var duplicateArtist = false;
                for (var j = 0; j < songsHolder.length; j++) {
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
                        if (selectedSong.tempo != "Slow") {
                            useSong();
                        }
                    } else if (songsHolder.length < 4) {
                        if (selectedSong.key != songsHolder[previousSongIndex].key && selectedSong.key != songsHolder[secondPreviousSongIndex].key) {
                            if (selectedSong.tempo == "Slow") {
                                if (songsHolder[previousSongIndex].tempo == "Slow" && songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[secondPreviousSongIndex].tempo == "Slow") {
                                } else {
                                    useSong();
                                }
                            } else {
                                useSong();
                            }
                        }
                    } else {
                        if (selectedSong.key != songsHolder[previousSongIndex].key && selectedSong.key != songsHolder[secondPreviousSongIndex].key) {
                            if (songsHolder.length == (songsNumber - 1)) {
                                if (selectedSong.tempo == "Fast") {
                                    useSong();
                                }
                            } else {
                                if (selectedSong.tempo == "Slow") {
                                    if (songsHolder[secondPreviousSongIndex].tempo != "Slow" && songsHolder[thirdPreviousSongIndex].tempo != "Slow") {
                                        useSong();
                                    }
                                } else {
                                    if (songsHolder.length == (songsNumber - 2)) {
                                        if (songsHolder[previousSongIndex].tempo == "Slow" || songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[thirdPreviousSongIndex].tempo == "Slow") {
                                            useSong();
                                        }
                                    } else {
                                        if (songsHolder[previousSongIndex].tempo == "Slow" || songsHolder[secondPreviousSongIndex].tempo == "Slow" || songsHolder[thirdPreviousSongIndex].tempo == "Slow" || songsHolder[fourthPreviousSongIndex].tempo == "Slow") {
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
    setList.push(setHolder);
    }
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