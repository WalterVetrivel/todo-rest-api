const {validationResult} = require('express-validator/check');

const Todo = require('../models/Todo');
const User = require('../models/User');

module.exports.getTodos = async (req, res, next) => {
	const userId = req.userId;
	const currentPage = req.query.page || 1;
	const perPage = 5;
	try {
		const totalTodos = await Todo.find({user: userId}).countDocuments();
		const todos = await Todo.find({user: userId})
			.sort({createdAt: -1})
			.skip((currentPage - 1) * perPage)
			.limit(perPage);
		return res.status(200).json({
			todos,
			totalTodos
		});
	} catch (err) {
		err.statusCode = 500;
		return next(err);
	}
};

module.exports.putTodo = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Invalid input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}
	const userId = req.userId;
	const title = req.body.title;
	const description = req.body.description;
	const todo = new Todo({
		title,
		description,
		user: userId
	});
	try {
		const newTodo = await todo.save();
		const user = await User.findById(userId);
		user.todos.push(newTodo);
		await user.save();
		return res.status(201).json({
			message: 'Todo created successfully',
			todo: newTodo
		});
	} catch (err) {
		err.statusCode = 500;
		return next(err);
	}
};

module.exports.deleteTodo = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Cannot delete');
		error.statusCode = 401;
		error.data = errors.array();
		return next(error);
	}

	const todoId = req.body.id;
	const userId = req.userId;
	try {
		const todo = await Todo.findOne({_id: todoId, user: userId});
		if (!todo) {
			const error = new Error('Cannot delete');
			error.statusCode = 403;
			throw error;
		}
		const deletedTodo = await Todo.findByIdAndRemove(todoId);
		const user = await User.findById(userId);
		user.todos.pull(todoId);
		await user.save();
		res
			.status(200)
			.json({message: 'Todo deleted successfully', todo: deletedTodo});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		return next(err);
	}
};

module.exports.patchTodo = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Invalid input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}
	const userId = req.userId;
	const todoId = req.body.id;
	const title = req.body.title;
	const description = req.body.description;
	try {
		const todo = await Todo.findOne({_id: todoId, user: userId});
		if (!todo) {
			const error = new Error('Cannot edit');
			error.statusCode = 403;
			throw next(error);
		}
		todo.title = title;
		todo.description = description;
		const updatedTodo = await todo.save();
		res.status(200).json({
			message: 'Todo updated successfully',
			todo: updatedTodo
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		return next(err);
	}
};

module.exports.getTodo = async (req, res, next) => {
	const todoId = req.params.id;
	const userId = req.userId;
	try {
		const todo = await Todo.findOne({_id: todoId, user: userId});
		if (!todo) {
			const error = new Error('Cannot find todo');
			error.statusCode = 404;
			throw next(error);
		}
		res.status(200).json({todo});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		return next(err);
	}
};

module.exports.patchCompleteTodo = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Invalid input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}
	const userId = req.userId;
	const todoId = req.body.id;
	try {
		const todo = await Todo.findOne({_id: todoId, user: userId});
		if (!todo) {
			const error = new Error('Cannot edit');
			error.statusCode = 403;
			throw next(error);
		}
		todo.completed = req.body.completed === 'true' ? true : false;
		const updatedTodo = await todo.save();
		res.status(200).json({
			message: 'Todo completed',
			todo: updatedTodo
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		return next(err);
	}
};
