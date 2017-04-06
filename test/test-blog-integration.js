const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

//Generates 10 blog posts
function seedBlogPosts() {
	console.info('seeding blog posts');
	const seedPosts = [];

	for (let i = 1; i <= 10; i++) {
		seedPosts.push(generateBlogPost());
	}

	return BlogPost.insertMany(seedPosts);
}

//generate post title
function generatePostTitle() {
	return faker.lorem.sentence();
}

//generate post content
function generatePostContent() {
	return faker.lorem.paragraph();
}

//generate post author
function generatePostAuthor() {
	return {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName()
	}
}

//generate object representing a blog post
function generateBlogPost() {
	return {
		author: generatePostAuthor(),
		title: generatePostTitle(),
		content: generatePostContent()
	}
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
 console.warn('Deleting database');
 return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedBlogPosts();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {
		it('should return all blog posts', function() {
	 // strategy:
   //    1. get back all posts returned by by GET request to `/posts`
   //    2. prove res has right status, data type
   //    3. prove the number of posts we got back is equal to number
   //       in db.
   //
   // need to have access to mutate and access `res` across
   // `.then()` calls below, so declare it here so can modify in place
   let res;
   return chai.request(app)
   	.get('/posts')
   	.then(function(_res) {
   		res = _res;
   		res.should.have.status(200);
   		res.body.should.have.length.of.at.least(1);
   		return BlogPost.count();
   	})
   	.then(function(count) {
   		res.body.should.have.length.of(count);
   	});
		});

		it('should return posts with the correct fields', function() {
			//Strategy: get all posts and check they have expected keys
			let resPost;
			return chai.request(app)
				.get('/posts')
				.then(function(res) {
					res.should.have.status(200);
					res.should.be.json;
					res.body.should.be.a('array');
					res.body.should.have.length.of.at.least(1);

					res.body.forEach(function(post) {
						post.should.be.a('object');
						post.should.include.keys('id','author','title','content', 'created');
					});
					resPost = res.body[0];
					return BlogPost.findById(resPost.id);
				})
				.then(function(post) {
						resPost.author.should.equal(post.authorName);
						resPost.title.should.equal(post.title);
						resPost.content.should.equal(post.content);
				});
		});

	});

	describe('POST endpoint', function() {
		//strategy: make a new blog post, prove it has the correct keys, and the id exists
		it('should add a new blog post', function() {
			const newPost = generateBlogPost();

			return chai.request(app)
				.post('/posts')
				.send(newPost)
				.then(function(res) {
					res.should.have.status(201);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.include.keys('id', 'author', 'title', 'content', 'created');
					res.body.id.should.not.be.null;
					res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
					res.body.title.should.equal(newPost.title);
					res.body.content.should.equal(newPost.content);

					return BlogPost.findById(res.body.id);
				})
				.then(function(post) {
					post.author.firstName.should.equal(newPost.author.firstName);
					post.author.lastName.should.equal(newPost.author.lastName);
					post.title.should.equal(newPost.title);
					post.content.should.equal(newPost.content);
				});
		});
	});

	describe('PUT endpoint', function() {
		//strategy: get a post from db, make a PUT request, prove returned post has data, prove post in db is updated correctly
		it('should update the provide fields', function() {
			const updatePost = {
				title: 'This title was edited',
				content: 'This post was edited',
				author: {
					firstName: 'New',
					lastName: 'Name'
				}
			}

			return BlogPost
				.findOne()
				.exec()
				.then(function(post) {
					updatePost.id = post.id;
					return chai.request(app)
						.put(`/posts/${post.id}`)
						.send(updatePost);
				})
				.then(function(res) {
					res.should.have.status(204);
					return BlogPost.findById(updatePost.id).exec();
				})
				.then(function(post) {
					post.title.should.equal(updatePost.title);
					post.content.should.equal(updatePost.content);
					post.author.firstName.should.equal(updatePost.author.firstName);
					post.author.lastName.should.equal(updatePost.author.lastName);
				});
		});
	});

	describe('DELETE endpoint', function() {
		//strategy: get a post, request delete for post id, check for response code, check post is removed from db
		it('delete post by id', function() {
			let post;

			return BlogPost
				.findOne()
				.exec()
				.then(function(_post) {
					post = _post;
					return chai.request(app).delete(`/posts/${post.id}`);
				})
				.then(function(res) {
					res.should.have.status(204);
					return BlogPost.findById(post.id).exec();
				})
				.then(function(_post) {
					should.not.exist(_post);
				});
		}); 
	});
});