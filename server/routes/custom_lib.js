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


function loggedIn(request, response, next) {
    if (request.user) {
        next();
    } else {
        response.sendFile(path.join(__dirname, '../public/views/login.html'));
    }
}

router.get('/', loggedIn, function(request, response) {
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

module.exports = router;