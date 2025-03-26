import express from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, getTasksByUser } from '../controllers/taskController.js';

const router = express.Router();

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.get('/user/:userId', getTasksByUser);

export default router;
