/*const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {DATABASE_URL} = require('../config');
const {User} = require('../models');
const {closeServer, runServer, app} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function generateUser() {
	const user = new User ({
		username: 'test@test.com',
		password: 5,
		drafts:[]
	});

	return user.save();
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deletidng database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  });
}


describe('blog posts API resource', function() {

  before(function() {
     runServer(TEST_DATABASE_URL);
	return generateUser();
     
  });

  beforeEach(function() {
    //return seedBlogPostData();
  });
  afterEach(function() {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });



  it('should list users on GET', function() {
    return chai.request(app)
      .get('/users')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) {
		console.log(item)
          item.should.be.a('object');
          item.should.have.all.keys(
            'id', 'name', 'drafts', 'created', 'sup');
        });
      });
  });

  /*
  describe('User endpoint', function() {



    it('should dfd return all existing posts', function( done ) {
			 return User
				.findOne({username: 'test@test.com'})

				.exec()
				.then(user => {
					console.log(user)
					user.password.should.equal(5);
				})
				.catch(done())
			});
  });

  /*
   * 				.then(user => {
					console.log(user)
					user.username.should.eql(5);
				})


  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  /*
  describe('GET endpoint', function() {

    it('should return all existing posts', function() {
      // strategy:
      //    1. get back all posts returned by by GET request to `/posts`
      //    2. prove res has right status, data type
      //    3. prove the number of posts we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/users')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.length.of.at.least(1);

          return User.count();
        })
        .then(count => {
          // the number of returned posts should be same
          // as number of posts in DB
          res.body.should.have.length.of(count);
        });
    });
  });
	*/


//});

