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
    console.log(request.body);
    var songId = request.body.custom_song_id;

    pg.connect(connectionString, function(err, client, done) {
        var deactivateSong = client.query("UPDATE user_custom_pref\
        SET include=FALSE\
        WHERE custom_song_id= $1;", [songId]);

        if (err) {
            console.log('Error', err);
            client.end();
            return response.send('error');
        }

        deactivateSong.on('end', function () {
            if (err) {
                console.log('Error', err);
                return response.send('Error', err);
            } else {
                console.log('Successfully updated song status to FALSE.');
                response.sendStatus(200);
                //console.log(response);
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

