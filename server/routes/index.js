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

router.get('/registration', function(request, response){
    console.log(request);
    response.sendFile(path.join(__dirname, '../public/views/registration.html'));
});

//Registration database queries.
router.post('/registration', function(request, response, err){
    //Capture info sent in request.
    var regInfo = {
        first: request.body.firstname,
        last: request.body.lastname,
        em: request.body.emailaddress,
        user: request.body.username,
        password: request.body.password
    };

    console.log('Registrant info', regInfo);

    //Connection to DB.  Two separate queries 1) add user to users table and
    // 2) add user to standard preferences table and set all preferences to default as TRUE.
    // updateStandardPref called within createUser to ensure both are completed.
    //Double check fail route on this.
    pg.connect(connectionString, function(err, client, done){

        var createUser = client.query("INSERT INTO users (first_name, last_name, email_address, username, password) \
        VALUES ($1, $2, $3, $4, $5);", [regInfo.first, regInfo.last, regInfo.em, regInfo.user, regInfo.password]);


        var usernameHolder;

        var checkUsername = function(){
            var checkUser = client.query("SELECT * FROM users WHERE users.username = '$1';", [regInfo.user]);

            checkUser.on('row', function(row){
                usernameHolder = row;
            })
        };
        //Should try to reformat this to prevent injection attack.
        var queryString = "ALTER TABLE user_standard_preferences ADD " + regInfo.user + " boolean DEFAULT TRUE;";

        var updateStandardPref = function(){
            //var queryStandardLibrary = client.query("ALTER TABLE user_standard_preferences ADD || quote_ident(regInfo.user) || boolean DEFAULT TRUE;");
            var queryAddStandardPrefCol = client.query(queryString);

            queryAddStandardPrefCol.on('end', function() {
                if(err) {
                    console.log('Error', err);
                    return response.send('Error', err);
                } else {
                    console.log('Posted successfully to database!');
                    response.sendStatus(200);
                }
                client.end();
            });
        };

        createUser.on('end', function(){
            updateStandardPref();
        });

    });

    pg.end();

});

//Success and failure redirects for user registration.
router.get('/home', function(request, response){
    console.log('Successful login for', request.user);
    response.sendFile(path.join(__dirname, '../public/views/home.html'));
});

router.get('/fail', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});

router.get('/standard_lib', function(request, response) {
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

router.get('/custom_lib', function(request, response) {
    console.log('/custom_lib get route hit');
    console.log(request.user);

    var thisUser = request.user.user_id;

    var userCustomLibrary = [];

    console.log('var thisUser is showing as:', thisUser);

    pg.connect(connectionString, function (err, client, done) {

        var getCustomLibrary = client.query('SELECT * FROM user_custom_pref\
            WHERE user_id = \'' + thisUser + '\'\
            ORDER BY user_custom_pref.artist;');

        getCustomLibrary.on('row', function (row) {
            //console.log("row is firing");
            userCustomLibrary.push(row);
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

router.post('/addsong', function(request, response){
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


            var addSongToCustom = client.query("INSERT INTO user_custom_pref (title, artist, song_key, tempo, user_id)\
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

router.post('/deactivate', function(request, response){
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

router.post('/activate', function(request, response){
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

router.post('/getset', function(request, response) {
    console.log('/getset get route hit');

    var userActiveSongs = [];

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
                return response.send("Successful collection of active songs!");
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


router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/fail'
}));

module.exports = router;