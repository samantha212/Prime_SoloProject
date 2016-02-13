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

router.post('/', function(request, response, err){

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

        pg.connect(connectionString, function (err, client) {
            var createUser = client.query("INSERT INTO users (first_name, last_name, email_address, username, password) \
            VALUES ($1, $2, $3, $4, $5)", [regInfo.first, regInfo.last, regInfo.em, regInfo.user, regInfo.password]);

            var queryAddStandardPrefCol = client.query("ALTER TABLE user_standard_preferences ADD " + regInfo.user + " boolean DEFAULT TRUE");

            createUser.on('end', function () {
                if (err) {
                    response.sendStatus(500);
                } else {
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
                }
            });

        });

        pg.end();
    }
});

module.exports = router;