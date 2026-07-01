const express = require('express');
const router = express.Router();
const {
  createTask, getMyTasks, getAllTasks, getTaskById, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // every route below requires a valid JWT

router.get('/all', authorize('admin'), getAllTasks); // must come before /:id

router.post('/', createTask);

router.get('/', getMyTasks);

router.get('/:id', getTaskById);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;