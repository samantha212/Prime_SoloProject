/**
 * Created by samanthamusselman on 2/2/16.
 */
var express = require('express');
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var router = express.Router();
var connectionString = 'postgres://localhost:5432/song_shaker';

pg.defaults.poolsize = 30;

//Find some way to store this.
function loggedIn(request, response, next) {
    console.log("Logged in function being checked.");
    if (request.user) {
        next();
    } else {
        response.sendFile(path.join(__dirname, '../public/views/login.html'));
    }
}

router.get('/printable_set', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/printable_set.html'));
});

//Success and failure redirects for user registration.
router.get('/home', loggedIn, function(request, response){
    console.log('Successful login for', request.user);
    response.sendFile(path.join(__dirname, '../public/views/home.html'));
});

router.get('/fail', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});

router.get('/login', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});





router.post('/deactivate_custom', loggedIn, function(request, response){
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

router.post('/activate', loggedIn, function(request, response){
    console.log(request.body);
    var songId = request.body.song_id;

    pg.connect(connectionString, function(err, client, done) {
        var deactivateSong = client.query("UPDATE user_standard_preferences\
        SET " + request.user.username + "= TRUE\
        WHERE song_id = $1;", [songId]);

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
                console.log('Successfully updated song status to TRUE.');
                response.sendStatus(200);
                //console.log(response);
            }
            client.end();


        });
    });
    pg.end();

});

router.post('/activate_custom', loggedIn, function(request, response){
    console.log(request.body);
    var songId = request.body.custom_song_id;
    console.log("activate songId", songId);
    pg.connect(connectionString, function(err, client, done) {
        var deactivateSong = client.query("UPDATE user_custom_pref\
        SET include= TRUE\
        WHERE custom_song_id = $1;", [songId]);

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
                console.log('Successfully updated song status to TRUE.');
                response.sendStatus(200);
                //console.log(response);
            }
            client.end();
        });
    });
    pg.end();

});

router.get('/logout', function(request, response){
    request.logout();
    console.log("logged out", request.user);

    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/fail'
}));

router.get('/', function(request, response){
    console.log("/ route being hit");
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});


module.exports = router;