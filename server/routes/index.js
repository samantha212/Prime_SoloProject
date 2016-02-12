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

router.get('/standard_lib', loggedIn, function(request, response) {
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

router.get('/custom_lib', loggedIn, function(request, response) {
    console.log('/custom_lib get route hit');
    console.log(request.user);

    var thisUser = request.user.user_id;

    var userCustomLibrary = {
        active: [],
        inactive: []
    };

    console.log('var thisUser is showing as:', thisUser);

    pg.connect(connectionString, function (err, client, done) {

        var getCustomLibrary = client.query('SELECT * FROM user_custom_pref\
            WHERE user_id = \'' + thisUser + '\'\
            ORDER BY user_custom_pref.artist;');

        getCustomLibrary.on('row', function (row) {
            //userCustomLibrary.push(row);
            if (row.include == true) {
                userCustomLibrary.active.push(row);
            } else {
                userCustomLibrary.inactive.push(row);
            }
        });

        getCustomLibrary.on('end', function () {
            //console.log("end is fired");
            client.end();
            return response.json(userCustomLibrary);
        });

        if (err) {
            console.log('Error', err);
            return response.send('Error', err);
        }
    });

    pg.end();
});

router.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});
router.get('/login', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});

router.post('/addsong', loggedIn, function(request, response){
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

router.post('/deactivate', loggedIn, function(request, response){
    console.log(request.body);
    var songId = request.body.song_id;

    pg.connect(connectionString, function(err, client, done) {
        var deactivateSong = client.query("UPDATE user_standard_preferences\
        SET " + request.user.username + "= FALSE\
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
                console.log('Successfully updated song status to FALSE.');
                response.sendStatus(200);
                //console.log(response);
            }
            client.end();


        });
    });
    pg.end();

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

module.exports = router;