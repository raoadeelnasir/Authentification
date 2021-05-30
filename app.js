require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const connectDB = require('./db');
const app = express();



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
const PORT = process.env.PORT


///   step no 1 (express-session)
app.use(session({
    secret: 'Our little secret cat',
    resave: false,
    saveUninitialized: false
}))
/// step no 2 (passportjs)
app.use(passport.initialize());
app.use(passport.session())

//@ Mongodb connection
require('./db');
connectDB();

const authSchema = new mongoose.Schema({
    username: String,
    password: String,
    //googleId to check or creat id in db (findorcreat)
    googleId: String,
})


/// step no. 3 (passport-local-mongoose)
authSchema.plugin(passportLocalMongoose);

//(findorcreat)
authSchema.plugin(findOrCreate);

const Auth = new mongoose.model('User', authSchema);

///step no.4  (passport-local-mongoose)+(stackover flow)
passport.use(Auth.createStrategy());

passport.serializeUser(function (Auth, done) {
    done(null, Auth);
});
passport.deserializeUser(function (Auth, done) {
    done(null, Auth);
});

// setup from passportjs 
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        //user findAndCreat pkg
        Auth.findOrCreate({ googleId: profile.id }, function (err, Auth) {
            return cb(err, Auth);
        });
    }
));

const Users = [];

//@Get Routes
app.get('/', (req, res) => {
    res.render('Home')
})
app.get('/Login', (req, res) => {
    res.render('Login')
})
app.get('/Register', (req, res) => {
    res.render('Register')
})

/// step no 6 
app.get('/Secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('Secrets')
    } else {
        res.redirect('/login')
    }
})

/// setep no 7 (logout from passportjs)
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

////step from passportjs
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect Secrets.
        res.redirect('/secrets');
    });




//@ Post Routs
app.post('/Register', (req, res) => {

    /// step no 5

    Auth.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/Secrets')
            })

        }
    })

});

app.post('/Login', (req, res) => {
    const userName = req.body.unsername;
    const passWord = req.body.password
    const newUser = new Auth({
        username: userName,
        password: passWord
    })
    ///   setup no. 7  (passportjs login())
    req.login(newUser, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/Secrets')
            })
        }
    })
})

app.listen(PORT, () => {
    console.log(`server is listenig at port ${PORT}`);
})
