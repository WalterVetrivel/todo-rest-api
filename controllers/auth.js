const {validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const jwtSecret = require('../utils/jwt-secret');

module.exports.putSignUp = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Invalid input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}

	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;

	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = new User({
			email,
			username,
			password: hashedPassword
		});
		const result = await user.save();
		return res.status(201).json({message: 'User created!', userId: result._id});
	} catch (err) {
		console.log(err);
		err.statusCode = 500;
		return next(err);
	}
};

module.exports.postLogin = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Invalid input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}

	const username = req.body.username;
	const password = req.body.password;

	try {
		const user = await User.findOne({username: username});
		if (!user) {
			const error = new Error('Invalid username or password');
			error.statusCode = 401;
			return next(error);
		}
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Invalid username or password');
			error.statusCode = 401;
			return next(error);
		}
		const token = jwt.sign(
			{
				username: user.username,
				userId: user._id.toString()
			},
			jwtSecret,
			{expiresIn: '1h'}
		);
		return res.status(200).json({token: token, userId: user._id.toString()});
	} catch (err) {
		err.statusCode = 500;
		return next(err);
	}
};
