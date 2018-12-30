const express = require('express');
const {body} = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/User');

const router = express.Router();

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Invalid email')
			.custom((value, {req}) => {
				return User.findOne({email: value}).then(user => {
					if (user) {
						console.log(user);
						return Promise.reject('Email already exists');
					}
				});
			})
			.normalizeEmail(),
		body('username')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a valid username')
			.isAlphanumeric()
			.withMessage('Please enter a valid username')
			.custom((value, {req}) => {
				return User.findOne({username: value}).then(user => {
					if (user) {
						console.log(user);
						return Promise.reject('Username already exists');
					}
				});
			}),
		body('password')
			.trim()
			.isLength({
				min: 8
			})
			.withMessage('Password must be at least 8 characters long')
	],
	authController.putSignUp
);

router.post(
	'/login',
	[
		body('username')
			.trim()
			.isString()
			.withMessage('Invalid username'),
		body('password')
			.trim()
			.isLength({
				min: 8
			})
	],
	authController.postLogin
);

module.exports = router;
