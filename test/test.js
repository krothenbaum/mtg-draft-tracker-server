/*function adder(a, b) {
  // validate that both inputs are numbers
  if (!(typeof a === 'number' && typeof b === 'number')) {
    throw Error('Oh no!');
  }
  return a + b;
}
	

it('should add two numbers', function() {
    // range of normal inputs, including
    // notable cases like negative answers
    const normalCases = [
      {a: 2, b: 3, expected: 5},
      {a: 200, b: 2000, expected: 2200},
      {a: 2, b: -5, expected: -3}
    ];
    // for each set of inputs (a, b), `adder` should
    // produce the expected value
    normalCases.forEach(function(input) {
      const answer = adder(input.a, input.b);
      answer.should.equal(input.expected);
    });
});




const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Users', function() {
  // Before our tests run, we activate the server. Our `runServer`
  // function returns a promise, and we return the promise by
  // doing `return runServer`. If we didn't return a promise here,
  // there's a possibility of a race condition where our tests start
  // running before our server has started.
  before(function() {
    return runServer();
  });

  // Close server after these tests run in case
  // we have other test modules that need to 
  // call `runServer`. If server is already running,
  // `runServer` will error out.
  after(function() {
    return closeServer();
  });
  // `chai.request.get` is an asynchronous operation. When
  // using Mocha with async operations, we need to either
  // return an ES6 promise or else pass a `done` callback to the
  // test that we call at the end. We prefer the first approach, so
  // we just return the chained `chai.request.get` object.
  it('should list users on GET', function() {
    return chai.request(app)
      .get('/users')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.above(0);
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys(
            'id', 'firstName', 'lastName', 'birthYear');
        });
      });
  });
});


describe('index page', function() {
  it('exists', function(done) {
    chai.request(app)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;
        done();
    });
  });
});
*/
