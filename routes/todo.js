const express = require('express');
const {body} = require('express-validator/check');

const isAuth = require('../middleware/is-auth');
const todoController = require('../controllers/todo');

const router = express.Router();

router.get('/todos', isAuth, todoController.getTodos);
router.put(
	'/todos',
	isAuth,
	[
		body('title')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a title'),
		body('description')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a description')
	],
	todoController.putTodo
);
router.delete(
	'/todos',
	isAuth,
	[
		body('id')
			.not()
			.isEmpty()
			.withMessage('Cannot delete')
	],
	todoController.deleteTodo
);
router.patch(
	'/todos',
	isAuth,
	[
		body('id')
			.not()
			.isEmpty()
			.withMessage('Invalid todo ID'),
		body('title')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a title'),
		body('description')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Please enter a description')
	],
	todoController.patchTodo
);
router.get('/todos/:id', isAuth, todoController.getTodo);
router.patch(
	'/todos/complete',
	isAuth,
	body('id')
		.not()
		.isEmpty()
		.withMessage('Invalid todo ID'),
	todoController.patchCompleteTodo
);

module.exports = router;
