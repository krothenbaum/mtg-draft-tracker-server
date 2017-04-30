const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');


const {DATABASE_URL, PORT} = require('./config');
const {User} = require('./models');

const {routes, app} = require('./routes/index');

// const app = express();

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
app.locals.moment = require('moment');

mongoose.Promise = global.Promise;

passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function matchesWon(matches) {
  let won = 0;
  let lost = 0;
  matches.forEach(match => {
    if (match.matchWon) {
      won++;
    }
    else {
      lost++;
    }
  })
  return `${won} - ${lost}`;
}

app.locals.matchesWon = matchesWon;

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