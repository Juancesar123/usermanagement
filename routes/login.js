const bcrypt = require('bcryptjs');
const config = require('config');
var express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user_model');
var router = express.Router();
router.post('/', function(req, res, next) {
    User.findOne({
				where: {
					email: req.body.email
				}
			}).then(user => {
				if (!user) {
					return res.status(404).send({
						auth: false,
						email: req.body.email,
						accessToken: null,
						message: "Error",
						errors: "User Not Found."
					});
				}
				var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
				if (!passwordIsValid) {
					return res.status(401).send({
						auth: false,
						email: req.body.email,
						accessToken: null,
						message: "Error",
						errors: "Invalid Password!"
					});
				}

				var token = 'Bearer ' + jwt.sign({
					email: user.email
				}, config.secret, {
					expiresIn: 86400 //24h expired
				});
				res.status(200).send({
					auth: true,
					email: req.body.email,
					accessToken: token,
					message: "Ok",
					errors: null
				});
			}).catch(err => {
                console.log(err);
				res.status(500).send({
					auth: false,
					id: req.body.id,
					accessToken: null,
					message: "Error",
					errors: err
				});
			});
});  
module.exports = router;
  