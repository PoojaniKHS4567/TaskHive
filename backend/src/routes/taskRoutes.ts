import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateTask } from '../middleware/validation';
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/taskController';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Task routes
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

export default router;