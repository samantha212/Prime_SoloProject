/**
 * Created by samanthamusselman on 2/2/16.
 */
var express = require('express');
var path = require('path');
var passport = require('passport');
var pg = require('pg');

var router = express.Router();
var connectionString = 'postgres://localhost:5432/song_shaker';


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

        var queryString = "ALTER TABLE user_standard_preferences ADD " + regInfo.user + " boolean DEFAULT TRUE;";

        var updateStandardPref = function(){
            var queryStandardLibrary = client.query(queryString);

            queryStandardLibrary.on('end', function() {
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

    var userStandardLibrary = [];

    console.log('var user is showing as:', thisUser);

    pg.connect(connectionString, function (err, client, done) {

        var getStandardLibrary = client.query("SELECT standard_library.song_id, standard_library.artist, standard_library.title, standard_library.key, standard_library.tempo, user_standard_preferences." + thisUser + " FROM standard_library \
        INNER JOIN user_standard_preferences\
        ON user_standard_preferences.song_id = standard_library.song_id;");

        getStandardLibrary.on('row', function (row) {
            userStandardLibrary.push(row);
        });

        getStandardLibrary.on('end', function () {
            client.end();
            return response.json(userStandardLibrary);
        });

        if (err) {
            console.log('Error', err);
            return response.send('Error', err);
        }

    });
});

router.get('/custom_lib', function(request, response) {
    console.log('/custom_lib get route hit');
    console.log(request.user);
    var thisUser = request.user.username;

    var userCustomLibrary = [];

    console.log('var thisUser is showing as:', thisUser);

    pg.connect(connectionString, function (err, client, done) {

        var getStandardLibrary = client.query('SELECT * FROM user_custom_pref\
        WHERE username = \'' + thisUser + '\';');

        getStandardLibrary.on('row', function (row) {
            userCustomLibrary.push(row);
        });

        getStandardLibrary.on('end', function () {
            client.end();
            return response.json(userCustomLibrary);
        });

        if (err) {
            console.log('Error', err);
            return response.send('Error', err);
        }

    });
});

router.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/fail'
}));

module.exports = router;