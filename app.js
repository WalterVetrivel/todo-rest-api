const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

const {mongodbUser, mongodbPassword} = require('./utils/mongodb_cred');

const app = express();

const MONGODB_URL = `mongodb+srv://${mongodbUser}:${mongodbPassword}@cluster0-ew2we.mongodb.net/todos?retryWrites=true`;

app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

// Routes
app.use('/auth', authRoutes);
app.use(todoRoutes);

// Error handling
app.use((err, req, res, next) => {
	console.log(err);
	const status = err.statusCode;
	const message = err.message;
	const data = err.data;
	res.status(status).json({
		message,
		data
	});
});

mongoose
	.connect(
		MONGODB_URL,
		{
			useNewUrlParser: true
		}
	)
	.then(result => {
		console.log('Connected');
		app.listen(8080);
	})
	.catch(err => {
		console.log(err);
	});
