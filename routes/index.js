const express = require('express');
const passport = require('passport');
const {User} = require('../models');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.email }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/success');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/success', function(req, res) {
    res.render('success', {});
});

router.get('/add-draft', function(req, res) {
    res.render('add-draft', { title: 'Add a new draft', user : req.user });
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

router.get('/dashboard', (req, res) => {
    if(!req.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', {title: 'Dashboard', user: req.user});
});

router.post('/user', (req, res) => {
  const requiredFields = ['date','sets', 'format', 'colorsPlayed','matches'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  User
    .findById(req.user.id)
    .exec()
    .then(user => {
      user.drafts.push(req.body);
      user.save();
      // res.status(201).json(user.apiRepr());
      res.status(201).redirect('/dashboard');
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
    });
});

module.exports = router;