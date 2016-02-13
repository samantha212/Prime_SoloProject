/**
 * Created by samanthamusselman on 2/12/16.
 */
var express = require('express');
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var router = express.Router();
var connectionString = 'postgres://localhost:5432/song_shaker';

pg.defaults.poolsize = 30;

router.get('/', loggedIn, function(request, response) {
    console.log('/standard_lib get route hit');

    var thisUser = request.user.username;

    var userStandardLibrary = {
        active: [],
        inactive: []
    };

    pg.connect(connectionString, function (err, client, done) {
        //Should probably fix this one, too, but I think it's okay, since the un comes from the session, and it was already validated via registration.
        var getStandardLibrary = client.query("SELECT standard_library.song_id, standard_library.artist, standard_library.title, standard_library.key, standard_library.tempo, user_standard_preferences." + thisUser + " \
        FROM standard_library \
        INNER JOIN user_standard_preferences\
        ON user_standard_preferences.song_id = standard_library.song_id\
        ORDER BY standard_library.artist;");

        var updateID = function(object){
            var songRow = object;
            //var copyFromKey = "object." + thisUser;
            songRow.status = object[thisUser];
            return songRow;
        };

        getStandardLibrary.on('row', function (row) {
            if (row[thisUser] == true) {
                userStandardLibrary.active.push(updateID(row));
            } else {
                userStandardLibrary.inactive.push(updateID(row));
            }
        });

        getStandardLibrary.on('end', function () {
            client.end();
            //console.log(userStandardLibrary);
            return response.json(userStandardLibrary);
        });

        if (err) {
            console.log('Error', err);
            return response.send('Error', err);
        }
    });

    pg.end();

});

function loggedIn(request, response, next) {
    if (request.user) {
        next();
    } else {
        response.sendFile(path.join(__dirname, '../public/views/login.html'));
    }
}

module.exports = router;