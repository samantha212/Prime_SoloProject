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

router.get('/', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/login.html'));
});

router.post('/registration', function(request, response, err){
    var regInfo = {
        first: request.body.firstname,
        last: request.body.lastname,
        em: request.body.emailaddress,
        user: request.body.username,
        password: request.body.password
    };

    console.log('Registrant info', regInfo);


    pg.connect(connectionString, function(err, client, done){
        var createUser = client.query("INSERT INTO users (first_name, last_name, email_address, username, password) \
        VALUES ($1, $2, $3, $4, $5);", [regInfo.first, regInfo.last, regInfo.em, regInfo.user, regInfo.password]);

        //var prefTableName = "CREATE TABLE user_standard_pref_" + regInfo.user;
        //var foo = "test"
        //var prefTableName = "CREATE TABLE user_standard_pref_" + foo;
        //
        //var createStandardSongLibrary = function(){
        //    var queryStandardLibrary = client.query("CREATE TABLE user_standard_pref_paul\
        //       (\
        //        username int DEFAULT 4,\
        //        song_title int,\
        //        include boolean DEFAULT TRUE\
        //        );");
        //
        //    queryStandardLibrary.on('end', function() {
        //        client.end();
        //    });
        //}

        createUser.on('end', function(){
            client.end();
            if(err) {
                console.log('Error', err);
                return response.send('Error', err);
            } else {
                console.log('Posted successfully to database!');
                response.sendStatus(200);
            }
            //createStandardSongLibrary();
        });

            //createStandardSongLibrary.on('end', function(){
            //if(err) {
            //    console.log('Error', err);
            //    return response.send('Error', err);
            //} else {
            //    console.log('Posted successfully to database!');
            //    response.sendStatus(200);
            //}
            //    Need to add an additional query to add rows to the standard preferences database.
            //client.end();
        //});

    });

});

router.get('/home', function(request, response){
    console.log('Successful login for', request.user);
    response.sendFile(path.join(__dirname, '../public/views/home.html'));
});

router.get('/fail', function(request, response){
    response.sendFile(path.join(__dirname, '../public/views/fail.html'));
});


router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/fail'
}));

module.exports = router;