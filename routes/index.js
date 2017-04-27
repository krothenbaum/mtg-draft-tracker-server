const express = require('express');
const passport = require('passport');
const {User} = require('../models');
const router = express.Router();

const handleAuth = (req, res, next) => {
 if(!req.user) {
	return res.status(202).redirect('/login');
 }
 else {
	next();
 }
};

const draftRequiredFields = (draft) => {
	const requiredFields = ['date','sets', 'format', 'colorsPlayed','matches'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in draft)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
}

const setMatchWon = (matches) => {
	for(let i=0; i < matches.length; i++) {
		const gamesWonInt = parseInt(matches[i].gamesWon);
		const gamesLostInt = parseInt(matches[i].gamesLost);
		if (gamesLostInt < gamesWonInt) {
			matches[i].matchWon = true;
		}
		else {
			matches[i].matchWon = false;
		}
	}
	return matches;
};

router.post('/user/add/draft', (req, res) => {
	draftRequiredFields(req.body);
	req.body.matches = setMatchWon(req.body.matches);

	User
	.findById(req.user.id) //req.
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

//add a draft
// router.use('/user/add/draft', handleAuth);

// router.post('/user/add/draft', addDraft);


router.get('/', function (req, res) {
		res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
		res.render('register', {title: 'Create account' });
});

router.get('/login', function(req, res) {
		res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
		res.status(200).redirect('/dashboard');
});

router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
});

router.get('/success', function(req, res) {
		res.render('success', {});
});

router.get('/add-draft', function(req, res) {
		if(!req.user) {
				return res.redirect('/login');
		}
		res.render('add-draft', { title: 'Add Draft', user : req.user });
});

router.get('/ping', function(req, res){
		res.status(200).send("pong!");
});

router.get('/dashboard', (req, res) => {
		if(!req.user) {
				return res.status(403).redirect('/login');
		}
		
		res.status(200).render('dashboard', {title: 'Dashboard', user: req.user});
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



//delete by draft id
router.post('/user/draft/delete', (req, res) => {
	if(!req.user) {
		return res.redirect('/login');
	}

	User
		.findById(req.user.id)
		.exec()
		.then(user => {
			user.drafts.pull(req.body.draftid);
			user.save();
			res.status(202).redirect('/dashboard');
		})
		.catch(err => {
			console.error(err);
			res.status(500).redirect('/dashboard');
		});
});

//update a draft record
router.post('/user/edit/update', (req, res) => {
	if(!req.user) {
		return res.redirect('/login');
	}

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
		.findOneAndUpdate({ _id : req.user.id, "drafts._id" : req.body.draftId }, { "drafts.$" : req.body })
		.exec()
		.then(result => {
			res.status(201).redirect('/dashboard');
		})
		.catch(err => {
			console.error(err);
			res.status(500).redirect('dashboard');
		});
});

//edit draft by draftid
router.get('/edit/:draftId', (req, res) => {
	if(!req.user) {
		return res.redirect('/login');
	}

	User
		.find({_id : req.user.id},{drafts:{ $elemMatch: {_id:req.params.draftId} }})
		.exec()
		.then(results => {
			console.log(results[0].drafts[0]);
			res.render('edit', {title: 'Edit Draft', user: req.user, draft: results[0].drafts[0]});
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

const constructChartData = (user) => {
	console.log(user.drafts[0].colorsPlayed);
	data = [
	{
		cat: 'White',
		val: 0
	},
	{
		cat: 'Blue',
		val: 0
	},
	{
		cat: 'Black',
		val: 0
	},
	{
		cat: 'Red',
		val: 0
	},
	{
		cat: 'Green',
		val: 0
	},]
	user.drafts.forEach(draft => {
		let colorArr = draft.colorsPlayed.split(' ');
		colorArr.forEach(color => {
			for(let i=0; i<data.length; i++) {
				if(data[i].cat === color) {
					data[i].val++;
				}
			}
		});
	});
	console.log(data);
};

module.exports = router;