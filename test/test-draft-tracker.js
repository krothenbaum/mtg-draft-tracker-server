const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();
const expect = chai.expect();

const {User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function generateSets() {
	const magicSets = ['AER-KLD','KLD','EMN-SOI','SOI','MM3'];
	return magicSets[Math.floor(Math.random() * magicSets.length)];
}

function generateFormat() {
	const magicFormats = ['Swiss League','Competitive League','Friendly League'];
	return magicFormats[Math.floor(Math.random() * magicFormats.length)];
}

function generateColorsPlayed() {
	const magicColors = ['White Blue','Blue Black','Black Red','Red Green','Green White','White Black','Blue Red','Black Green','Red Whiute','Green Blue'];
	return magicColors[Math.floor(Math.random() * magicColors.length)];
}

function generateResult(numWon) {
	if(numWon === 2) {
		return true;
	} else {
		return false;
	}
}

function generateMatches() {
	let matches = [];
	for (let i = 0; i<3; i++) {
		const numWon = Math.floor(Math.random() * 3)
		const match = {
			matchName: `match${i+1}`,
			matchWon: generateResult(numWon),
			gamesWon: numWon,
			gamesLost: 2-numWon
		}
		matches.push(match);
	}
	return matches;
}

function generateDrafts() {
	let drafts = [];
	for (let i = 0; i < 3; i++) {
		const draft = {
			date: faker.date.past(),
			sets: generateSets(),
			format: generateFormat(),
			colorsPlayed: generateColorsPlayed(),
			matches: generateMatches()
		}
		drafts.push(draft);
	}

	return drafts;
}

//generate a User
function generateUser() {
	const user = new User ({
		username: 'test@test.com',
		password: 'test',
		drafts: generateDrafts()
	});

	return user.save();
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
 console.warn('Deleting database');
 return mongoose.connection.dropDatabase();
}

describe('Draft Tracker API resource', function() {

	before(function() {
		runServer(TEST_DATABASE_URL, 8080);
		return generateUser();
	});

	// beforeEach(function() {
		
	// });

	// afterEach(function() {
		
	// });

	after(function() {
		// tearDownDb();
		return closeServer();
	});

	describe('find user', () => {
		it('should have username test@test.com', () => {
			User
				.findOne({username: 'test@test.com'})
				.exec()
				.then(user => {
					console.log(user)
					user.username.should.eql('test@test.com');
				})
				.catch(err => {
					console.error(err);
				});
		});
	});

	describe('GET dashboard endpoint', () => {
		it('should not have status 302', () => {
			return chai.request(app)
				.get('/dashboard')
				.then(res => {
					res.should.have.status(404);
				})
				.catch(err => {
					console.error(err);
				});
		});
	});

	// describe('Register User Endpoint',() => {
	// 	it('should redirect to dashboard after user registered', () => {

	// 		return chai.request(app)
	// 			.post('/register')
	// 			.set('Token', 'text/plain')
	// 			.set('content-type', 'application/x-www-form-urlencoded')
	// 			.type('form')
	// 			.send('username=newuser@test.com')
	// 			.send('password=abc123')
	// 			.then(res => {
	// 				res.should.have.status(200);
	// 				expect(res).to.redirectTo('/dashboard');
	// 			})
	// 			.catch(err => {
	// 				console.error(err);
	// 			});
	// 	});
	// });

	// describe('Login Endpoint', () => {
	// 	it('should redirect to dashboard on successful login', () => {
	// 		let agent = chai.request.agent(app);
	// 		agent
	// 			.post('/login')
	// 			.send({username: 'test@test.com', password: 'test'})
	// 			.then(res => {
	// 				res.should.have.status(200);
	// 				expect(res).to.redirectTo('/dashboard');
	// 			})
	// 			.catch(err => {
	// 				console.error(err);
	// 			});
	// 	});
	// });

	// describe('Add Draft Endpoint', () => {
	// 	it('should add a draft to user', () => {
	// 		return chai.request(app)
	// 			.post('/user/add/draft')
	// 			.set('Token', 'text/plain')
	// 			.set('content-type', 'application/x-www-form-urlencoded')
	// 			.type('form')
	// 			.send('date=2017-04-09T00:02:08.197Z')
	// 			.send('sets=AER-KLD')
	// 			.send('format=Swiss League')
	// 			.send('colorsPlayed=White Blue')
	// 			.send('matches[0][matchName]=match1')
	// 			.send('matches[0][gamesWon]=2')
	// 			.send('matches[0][gamesLost]=0')
	// 			.send('matches[1][matchName]=match2')
	// 			.send('matches[1][gamesWon]=2')
	// 			.send('matches[1][gamesLost]=0')
	// 			.send('matches[2][matchName]=match3')
	// 			.send('matches[2][gamesWon]=2')
	// 			.send('matches[2][gamesLost]=0')
	// 			.then(res => {
	// 				res.should.have.status(201);
	// 				expect(res).to.redirectTo('/dashboard');
	// 			})
	// 			.catch(err => {
	// 				console.error(err);
	// 			});
	// 	});
	// });

	// describe('Delete Draft Endpoint', () => {
	// 	it('should remove draft and redirect to dashboard', () => {
	// 		let draftId = '';
	// 		User.
	// 			findOne({username: 'test@test.com'})
	// 			.exec()
	// 			.then(user => {
	// 				draftId = user.drafts[0]._id;
	// 				console.log(draftId);
	// 			});

	// 		return chai.request(app)
	// 			.post('/user/draft/delete')
	// 			.send({draftid: draftId})
	// 			.then(res => {
	// 				res.should.have.status(202);
	// 				expect(res).to.redirectTo('/dashboard');
	// 			});
	// 	});
	// });

});

	// 	it('should return posts with the correct fields', function() {
	// 		//Strategy: get all posts and check they have expected keys
	// 		let resPost;
	// 		return chai.request(app)
	// 			.get('/posts')
	// 			.then(function(res) {
	// 				res.should.have.status(200);
	// 				res.should.be.json;
	// 				res.body.should.be.a('array');
	// 				res.body.should.have.length.of.at.least(1);

	// 				res.body.forEach(function(post) {
	// 					post.should.be.a('object');
	// 					post.should.include.keys('id','author','title','content', 'created');
	// 				});
	// 				resPost = res.body[0];
	// 				return BlogPost.findById(resPost.id);
	// 			})
	// 			.then(function(post) {
	// 					resPost.author.should.equal(post.authorName);
	// 					resPost.title.should.equal(post.title);
	// 					resPost.content.should.equal(post.content);
	// 			});
	// 	});

	// });

	// describe('POST endpoint', function() {
	// 	//strategy: make a new blog post, prove it has the correct keys, and the id exists
	// 	it('should add a new blog post', function() {
	// 		const newPost = generateBlogPost();

	// 		return chai.request(app)
	// 			.post('/posts')
	// 			.send(newPost)
	// 			.then(function(res) {
	// 				res.should.have.status(201);
	// 				res.should.be.json;
	// 				res.body.should.be.a('object');
	// 				res.body.should.include.keys('id', 'author', 'title', 'content', 'created');
	// 				res.body.id.should.not.be.null;
	// 				res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
	// 				res.body.title.should.equal(newPost.title);
	// 				res.body.content.should.equal(newPost.content);

	// 				return BlogPost.findById(res.body.id);
	// 			})
	// 			.then(function(post) {
	// 				post.author.firstName.should.equal(newPost.author.firstName);
	// 				post.author.lastName.should.equal(newPost.author.lastName);
	// 				post.title.should.equal(newPost.title);
	// 				post.content.should.equal(newPost.content);
	// 			});
	// 	});
	// });

	// describe('PUT endpoint', function() {
	// 	//strategy: get a post from db, make a PUT request, prove returned post has data, prove post in db is updated correctly
	// 	it('should update the provide fields', function() {
	// 		const updatePost = {
	// 			title: 'This title was edited',
	// 			content: 'This post was edited',
	// 			author: {
	// 				firstName: 'New',
	// 				lastName: 'Name'
	// 			}
	// 		}

	// 		return BlogPost
	// 			.findOne()
	// 			.exec()
	// 			.then(function(post) {
	// 				updatePost.id = post.id;
	// 				return chai.request(app)
	// 					.put(`/posts/${post.id}`)
	// 					.send(updatePost);
	// 			})
	// 			.then(function(res) {
	// 				res.should.have.status(204);
	// 				return BlogPost.findById(updatePost.id).exec();
	// 			})
	// 			.then(function(post) {
	// 				post.title.should.equal(updatePost.title);
	// 				post.content.should.equal(updatePost.content);
	// 				post.author.firstName.should.equal(updatePost.author.firstName);
	// 				post.author.lastName.should.equal(updatePost.author.lastName);
	// 			});
	// 	});
	// });

	// describe('DELETE endpoint', function() {
	// 	//strategy: get a post, request delete for post id, check for response code, check post is removed from db
	// 	it('delete post by id', function() {
	// 		let post;

	// 		return BlogPost
	// 			.findOne()
	// 			.exec()
	// 			.then(function(_post) {
	// 				post = _post;
	// 				return chai.request(app).delete(`/posts/${post.id}`);
	// 			})
	// 			.then(function(res) {
	// 				res.should.have.status(204);
	// 				return BlogPost.findById(post.id).exec();
	// 			})
	// 			.then(function(_post) {
	// 				should.not.exist(_post);
	// 			});
	// 	}); 
	// });
// });