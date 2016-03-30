/**
 * Created by samanthamusselman on 2/2/16.
 */
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var pg = require('pg');
var bodyParser = require('body-parser');
var path = require('path');

var index = require('./routes/index');
var registration = require('./routes/registration');
var shaker = require('./routes/shaker');
var standardLib = require('./routes/standard_lib');
var customLib = require('./routes/custom_lib');
var addsong = require('./routes/addsong');
var deactivateStandard = require('./routes/deactivate_standard_song');
var activateStandard = require('./routes/activate_standard_song');
var deactivateCustom = require('./routes/deactivate_custom_song');
var activateCustom = require('./routes/activate_custom_song');

var localStrategy = require('passport-local').Strategy;

var app = express();

var connectionString = 'postgres://localhost:5432/song_shaker';

//Pool size for PostgreSQL
pg.defaults.poolsize = 50;

app.use(express.static(path.join(__dirname, './public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//[][][][][][][][][][][][][][][][][][][][][][][]
//          Passport Things
//[][][][][][][][][][][][][][][][][][][][][][][]

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 6000000, secure: false}
}));


app.use(passport.initialize());
app.use(passport.session());

app.use('/registration', registration);
app.use('/getset', shaker);
app.use('/standard_lib', standardLib);
app.use('/#/standard_lib', standardLib);
app.use('/custom_lib', customLib);
app.use('/addsong', addsong);
app.use('/deactivate', deactivateStandard);
app.use('/activate', activateStandard);
app.use('/deactivate_custom', deactivateCustom);
app.use('/activate_custom', activateCustom);
app.use('/', index);

app.get('/*', function(request, response){
    response.sendFile(path.join(__dirname, '../server/public/views/home.html'));
});

passport.serializeUser(function(user, done){
    done(null, user.user_id);
});

passport.deserializeUser(function(id, done){
    pg.connect(connectionString, function(err, client){
        var user = {};

        var query = client.query('SELECT * FROM users WHERE user_id = $1', [id]);

        query.on('row', function(row){
            user = row;
            done(null, user);
        })
    })
});

passport.use('local', new localStrategy({
    passReqToCallback: true,
    usernameField: 'username'

}, function (req, username, password, done){
    pg.connect(connectionString, function(err, client){
        var user = {};

        var query = client.query('SELECT * FROM users WHERE username = $1', [username]);

        query.on('row', function(row){
            user = row;
            console.log('User object', user);
        });

        query.on('end', function(){
            if(user && user.password === password) {
                console.log('Success');
                done(null, user);
            } else {
                done(null, false);
            }
            client.end();
        });
    });
}));

//[][][][][][][][][][][][][][][][][][][][][][][][]
//            SERVER SET UP
//[][][][][][][][][][][][][][][][][][][][][][][][]
app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get('port'), function(){
    var port = server.address().port;
    console.log('Listening on port', port);
});