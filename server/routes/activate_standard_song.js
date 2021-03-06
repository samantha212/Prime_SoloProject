/**
 * Created by samanthamusselman on 2/13/16.
 */
var express = require('express');
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var router = express.Router();
var connectionString = 'postgres://localhost:5432/song_shaker';

pg.defaults.poolsize = 30;


router.post('/', loggedIn, function(request, response){

    var songId = request.body.song_id;

    pg.connect(connectionString, function(err, client, done) {
        var deactivateSong = client.query("UPDATE user_standard_preferences\
        SET " + request.user.username + "= TRUE\
        WHERE song_id = $1;", [songId]);

        if (err) {
            client.end();
            return response.send('error');
        }

        deactivateSong.on('end', function () {
            if (err) {
                return response.send('Error', err);
            } else {
                response.sendStatus(200);
            }
            client.end();


        });
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
