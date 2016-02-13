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