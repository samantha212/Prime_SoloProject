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


router.get('/', function(request, response){
    console.log(request);
    response.sendFile(path.join(__dirname, '../public/views/registration.html'));
});

//Registration database queries.
router.post('/', function(request, response, err){
    //Capture info sent in request.
    var regInfo = {
        first: request.body.firstname,
        last: request.body.lastname,
        em: request.body.emailaddress,
        user: request.body.username,
        password: request.body.password
    };

    if(!regInfo.first || !regInfo.last || !regInfo.em || !regInfo.user || !regInfo.password) {
        response.sendStatus(500);
    } else {

        console.log('Registrant info', regInfo);

        //Connection to DB.  Two separate queries 1) add user to users table and
        // 2) add user to standard preferences table and set all preferences to default as TRUE.
        // updateStandardPref called within createUser to ensure both are completed.
        //Double check fail route on this.
        pg.connect(connectionString, function (err, client, done) {

            var createUser = client.query("INSERT INTO users (first_name, last_name, email_address, username, password) \
        VALUES ($1, $2, $3, $4, $5);", [regInfo.first, regInfo.last, regInfo.em, regInfo.user, regInfo.password]);


            var usernameHolder;

            var checkUsername = function () {
                var checkUser = client.query("SELECT * FROM users WHERE users.username = '$1';", [regInfo.user]);

                checkUser.on('row', function (row) {
                    usernameHolder = row;
                })
            };
            //Should try to reformat this to prevent injection attack.
            var queryString = "ALTER TABLE user_standard_preferences ADD " + regInfo.user + " boolean DEFAULT TRUE;";

            var updateStandardPref = function () {
                //var queryStandardLibrary = client.query("ALTER TABLE user_standard_preferences ADD || quote_ident(regInfo.user) || boolean DEFAULT TRUE;");
                var queryAddStandardPrefCol = client.query(queryString);

                queryAddStandardPrefCol.on('end', function () {
                    if (err) {
                        console.log('Error', err);
                        return response.send('Error', err);
                    } else {
                        console.log('Posted successfully to database!');
                        response.sendStatus(200);
                    }
                    client.end();
                });
            };

            createUser.on('end', function () {
                updateStandardPref();
            });

        });

        pg.end();
    }
});

module.exports = router;