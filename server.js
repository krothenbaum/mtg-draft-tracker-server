const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const {DATABASE_URL, PORT} = require('./config');
const {User} = require('./models');

const routes = require('./routes/index');

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'siege rhino',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);

mongoose.Promise = global.Promise;

passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// app.get('/users', (req, res) => {
//   User
//     .find()
//     .exec()
//     .then(users => {
//       res.status(200).json(users.map(user => user.apiRepr()));
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({error: 'something went terribly wrong'});
//     });
// });

// app.get('/users/:id', (req, res) => {
//   User
//     .findById(req.params.id)
//     .exec()
//     .then(post => res.json(post.apiRepr()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({error: 'something went horribly awry'});
//     });
// });

// //Get all draft records for user by user id
// app.get('/users/:id/drafts', (req, res) => {
//   User
//     .findById(req.params.id)
//     .exec()
//     .then(user => {
//       let drafts = [];
//       user.drafts.forEach(draft => {
//         drafts.push(draft);
//       });
//       res.json(user.draftRepr());
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({error: 'Something went wrong'});
//     });
// });

// app.post('/users', (req, res) => {
//   const requiredFields = ['firstName','lastName','email','password'];
//   for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }

//   User
//     .create({
//       name: {
//         firstName: req.body.firstName,
//         lastName: req.body.lastName
//       },
//       email: req.body.email,
//       password: req.body.password
//     })
//     .then(user => res.status(201).json(user.apiRepr()))
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({error: 'Something went wrong'});
//     });
// });

// //Update user with new draft record
// app.post('/users/:id/drafts', (req, res) => {
//   const requiredFields = ['date','sets', 'format', 'colorsPlayed','matches'];
//   for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }

//   User
//     .findById(req.params.id)
//     .exec()
//     .then(user => {
//       user.drafts.push(req.body);
//       user.save();
//       res.status(201).json(user.apiRepr());
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({error: 'Something went wrong'});
//     });
// });

// app.delete('/users/:id', (req, res) => {
//   User
//     .findByIdAndRemove(req.params.id)
//     .exec()
//     .then(() => {
//       res.status(204).json({message: 'success'});
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({error: 'something went terribly wrong'});
//     });
// });


// //remove draft record by draft id from user by user id
// app.delete('/users/:id/draft/:draftid', (req, res) => {
//   User
//     .findById(req.params.id)
//     .exec()
//     .then((user) => {
//       user.drafts.pull({_id: req.params.draftid});
//       user.save();
//       res.status(204).json({message: 'draft record removed'});
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({error: 'something went wrong'});
//     });
// });


// app.put('/users/:id', (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       error: 'Request path id and request body id values must match'
//     });
//   }

//   const updated = {};
//   const updateableFields = ['name', 'email', 'drafts'];
//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });

//   User
//     .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
//     .exec()
//     .then(updatedUser => res.status(204).json(updatedUser.apiRepr()))
//     .catch(err => res.status(500).json({message: 'Something went wrong'}));
// });

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};