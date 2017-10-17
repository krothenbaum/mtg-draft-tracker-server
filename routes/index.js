const express = require('express');
const passport = require('passport');
const {User} = require('../models');
const router = express.Router();
const app = express();

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

//add a draft
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

router.get('/dashboard', (req, res) => {
		if(!req.user) {
				return res.status(403).redirect('/login');
		}

		// app.locals.blah = 'blaipp';
		if(req.user.drafts.length > 0) {
			app.locals.donutData = constructChartData(req.user);
			app.locals.winRate = constructWinRate(req.user);
		}

		res.status(200).render('dashboard-update', {title: 'Dashboard', user: req.user});
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
	console.log(req.body.drafId);
	if(!req.user) {
		return res.redirect('/login');
	}

	User
		.findById(req.user.id)
		.exec()
		.then(user => {
			user.drafts.pull(req.body.draftId);
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
	let updatedDate = new Date(req.body.date);
	updatedDate.setTime( updatedDate.getTime() + updatedDate.getTimezoneOffset()*60*1000 );
	updatedDate = updatedDate.toISOString();

	if(!req.user) {
		return res.redirect('/login');
	}

	draftRequiredFields(req.body);
	req.body.matches = setMatchWon(req.body.matches);

	User
		.findOneAndUpdate({ _id : req.user.id, 'drafts._id' : req.body.draftId }, { $set: {
				'drafts.$.date': updatedDate,
				'drafts.$.matches': req.body.matches,
				'drafts.$.colorsPlayed': req.body.colorsPlayed,
				'drafts.$.format': req.body.format,
				'drafts.$.sets': req.body.sets
			}
		})
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
			res.status(200).render('edit-draft', {title: 'Edit Draft', user: req.user, draft: results[0].drafts[0]});
		})
		.catch(err => {
			console.error(err);
			res.status(500).redirect('/dashboard');
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

	var obj = {
		total:0,
		type:"Colors",
		unit:"M",
		data: data
	}

	user.drafts.forEach(draft => {
		let colorArr = draft.colorsPlayed.split(' ');
		colorArr.forEach(color => {
			for(let i=0; i<data.length; i++) {
				if(data[i].cat === color) {
					data[i].val++;
					obj.total++
				}
			}
		});
	});

	return [obj];
};

const constructWinRate = (user) => {
	let totalMatchesPlayed = 0;
	let matchesWon = 0;

	user.drafts.forEach(draft => {
		draft.matches.forEach(match => {
			totalMatchesPlayed++;
			if (match.matchWon) {
				matchesWon++;
			}
		})
	});

		return Math.round((matchesWon/totalMatchesPlayed) * 100);
}

var routes = router;
module.exports = {routes, app};
