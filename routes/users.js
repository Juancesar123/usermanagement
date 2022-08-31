var express = require('express');
var router = express.Router();
const { User, validateUser } = require('../models/user_model');
const { hasValue } = require('../middleware/helper');
const bcrypt = require('bcryptjs');
const {verifyToken} = require('../middleware/auth')
const config = require('config');
/* GET users listing. */
//Get User List
router.get('/',[verifyToken], async (req, res) => {
	const search = req.query.search;
	const sort = req.query.sort === 'asc' ? 1 : -1;
	let page = req.query.page && hasValue(req.query.page) ? parseInt(req.query.page) : 1;
	let limit =
		req.query.limit && hasValue(req.query.limit) ? parseInt(req.query.limit) : parseInt(config.get('query_limit'));
	const fields =
		'_id email name created_at updated_at deleted_at';
	const options = {
		page: page,
		limit: limit,
		sort: { name: sort },
		select: fields,
	};

	let result = {};
	let filter = {
    deleted_at:{$eq:null}
  };

	if (search && hasValue(search)) {
		const pattern = `.*${search}.*`;
		filter.$or = [
			{ name: { $regex: pattern, $options: 'i' } },
			{ email: { $regex: pattern, $options: 'i' } },
		];
	}

	try {
		const users = await User.paginate(filter, options);
		if (users) {
			result.data = users.docs;
			result.pagination = {
				total: users.totalDocs,
				limit: users.limit,
				page: users.page,
				prev: users.prevPage,
				next: users.nextPage,
			};
		}

		res.send(result);
	} catch (err) {
		console.log('error', err);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});
router.post('/', async(req,res) => {
  // console.log(req.body.username);
  try {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        created_at: Date.now()
    })
    await user.save();
    res.status(200).send({ data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
  
})
//Get User by ID
router.get('/:id', [verifyToken], async (req, res) => {
	try {
		const fields =
			'_id email name created_at updated_at';

		const filter = { _id: req.params.id };

		let user = await User.findOne(filter).select(fields);
		if (!user) return res.status(400).send({ error: 'Invalid User ID' });

		res.send({ data: user });
	} catch (err) {
		console.log('error', err);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});

router.put('/:user_id',[verifyToken], async (req, res) => {
	try {
		const id = req.params.user_id;
		let userById = await User.findOne({ _id: id });
		if (!userById) return res.status(404).send({ error: 'Unknown User ID' });

		if (hasValue(req.body.name)) userById.name = req.body.name;
    if (hasValue(req.body.email)) userById.email = req.body.email
    if (hasValue(req.body.password)) userById.password = bcrypt.hashSync(req.body.password, 8)
    if (hasValue(req.body.updated_at)) userById.updated_at = Date.now();
		const { error } = validateUser(userById);
		if (error) return res.status(400).send(showError(error));
		await userById.save()
		res.send({ data: userById });
	} catch (err) {
		console.log('error', err);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});
router.delete('/:user_id', async (req, res) => {
  try {
		const id = req.params.user_id;
		let userById = await User.findOne({ _id: id });
		if (!userById) return res.status(404).send({ error: 'Unknown User ID' });

		if (hasValue(req.body.name)) userById.name = req.body.name;
    if (hasValue(req.body.email)) userById.email = req.body.email
    if (hasValue(req.body.password)) userById.password = bcrypt.hashSync(req.body.password, 8)
    userById.deleted_at = Date.now();
		const { error } = validateUser(userById);
		if (error) return res.status(400).send(showError(error));
		await userById.save()
		res.send({ data: userById });
	} catch (err) {
		console.log('error', err);
		res.status(500).send({ error: 'Internal Server Error' });
	}
});
module.exports = router;
