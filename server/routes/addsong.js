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
    console.log(request);

    var songInfo = {
        title: request.body.title,
        artist: request.body.artist,
        key: request.body.key,
        tempo: request.body.tempo,
        userID: request.user.user_id
    };

    if(!songInfo.title || !songInfo.artist || !songInfo.key || !songInfo.tempo || !songInfo.userID) {
        response.sendStatus(500);
    } else {
        pg.connect(connectionString, function(err, client, done){


            var addSongToCustom = client.query("INSERT INTO user_custom_pref (title, artist, key, tempo, user_id)\
            VALUES ($1, $2, $3, $4, $5);", [songInfo.title, songInfo.artist, songInfo.key, songInfo.tempo, songInfo.userID]);

            if (err) {
                console.log('Error', err);
                client.end();
                return response.send('error');
            }

            addSongToCustom.on('end', function() {
                if(err) {
                    console.log('Error', err);
                    return response.send('Error', err);
                } else {
                    console.log('Posted successfully to database!');
                    response.send("Success add song!");
                    console.log(response);
                }
                client.end();
            });
        });
    }

});

function loggedIn(request, response, next) {
    if (request.user) {
        next();
    } else {
        response.sendFile(path.join(__dirname, '../public/views/login.html'));
    }
}

module.exports = router;