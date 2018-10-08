const express = require('express')
const router = express.Router();
const mongoClient = require('../db/connect');
const UserCollection = require('../models/user');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config.js').config;

passport.use(new LocalStrategy( function(username, password, done) {

    UserCollection.getUserByUsername(username, (err, user) => {
        if (err) { throw err; }
        if (!user)  { console.log('Unknown user'); return done(null, false, {message: 'Unknown user'}); }
        UserCollection.comparePassword(password, user.password, (err, isMatch) => {
            if (err) { throw err; }
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
        });
    });
}));

router.post('/register', (req, res) => {

    const { username, password } = req.body;

    UserCollection.findOne({ username: username }, (err, user) => {

        if (err) {
            console.log('User.js post error: ', err)
        } else if (user) {
            res.send({error: `Sorry, already a user with the username: ${username}`})
        } else {
            
            const newUser = new UserCollection({
                username: username,
                status: 'offline',
                password: password
            });

            UserCollection.createUser(newUser, function(err, user) {
                
            });
        }
    });

    res.end();
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserCollection.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = jwt.sign({username:req.user.username,password:req.user.password},config.jwtSecret,{expiresIn: 60 * 24 * 7});
    res.cookie('jwt', token, { httpOnly: true, secure: true });
    UserCollection.setUserOnline(req.user.username);
    res.send({token:token});
});

router.get('/', (req, res, next) => {
    if (req.user) {
        res.json({ user: req.user })
    } else {
        res.json({ user: null })
    }
})

router.post('/logout', passport.authenticate('local'), (req, res) => {
    if (req.user) {
        req.logout();
        res.clearCookie('jwt');
        res.send({ msg: 'logging out' })
    } else {
        res.send({ msg: 'no user to log out' })
    }
})

module.exports = router;