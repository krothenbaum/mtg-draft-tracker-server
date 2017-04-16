const express = require('express');
const passport = require('passport');
const {User} = require('../models');
const router = express.Router();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', {title: 'Create a new account' });
});

router.post('/register', (req, res) => {
  User.register(new User({ username : req.body.email }), req.body.password, err => {
    if (err) {
      return res.render('register', {});
    } 

    passport.authenticate('local')(req, res, () => {
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/dashboard');
      });      
    });
  });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/success', function(req, res) {
    res.render('success', {});
});

router.get('/add-draft', function(req, res) {
    res.render('add-draft', { title: 'Add Draft', user : req.user });
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

//add a draft
router.post('/user/add/draft', (req, res) => {
  const requiredFields = ['date','sets', 'format', 'colorsPlayed','matches'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  for(let i=0; i < req.body.matches.length; i++) {
    const gamesWonInt = parseInt(req.body.matches[i].gamesWon);
    const gamesLostInt = parseInt(req.body.matches[i].gamesLost);
    if (gamesLostInt < gamesWonInt) {
      req.body.matches[i].matchWon = true;
    }
    else {
      req.body.matches[i].matchWon = false;
    }
  }

  User
    .findById(req.user.id)
    .exec()
    .then(user => {
      user.drafts.push(req.body);
      user.save();
      res.status(201).redirect('/dashboard');
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
    });
});

//delete by draft id
router.post('/user/draft/delete', (req, res) => {
  User
    .findById(req.body.userid)
    .exec()
    .then(user => {
      user.drafts.pull(req.body.draftid);
      user.save();
      res.status(204).redirect('/dashboard');
    })
    .catch(err => {
      console.error(err);
      res.status(500).redirect('/dashboard');
    });
});

//get draft to edit
router.get('/edit-draft', (req, res) => {
  User
   .findById(req.body.userid)
   .exec()
   .then(user => {
      // render('edit-draft', { title: 'Add Draft', user : req.draft })
   })
   .catch(err => {
    console.error(err);
    res.status(500).redirect('/dashboard');
   })
});


//update draft record
router.post('/user/draft/edit', (req, res) => {
  User
    .findById(req.body.userid)
    .exec()
    .then(user => {
      //find draft and update
    })
    .catch(err => {
      console.error(err);
      res.status(500).redirect('/dashboard');
    });
});

router.get('/users', (req, res) => {
  User
    .find()
    .exec()
    .then(users => {
      res.status(200).json(users.map(user => user.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

module.exports = router;