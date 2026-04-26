import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { Task } from '../models/Task';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { priority, status } = req.query;
    
    // Build query
    const query: any = { userId: req.user._id };
    
    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    // Filter by completion status
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'active') {
      query.completed = false;
    }
    
    // Get tasks
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate statistics for dashboard
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      // ✅ 4th Card: Overdue tasks (due date passed, not completed)
      overdue: tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && !t.completed;
      }).length
    };
    
    res.json({ tasks, stats });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  try {
    const taskData = {
      ...req.body,
      userId: req.user._id
    };
    
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    delete req.body.userId;
    Object.assign(task, req.body);
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    
    res.json({ 
      message: 'Task deleted successfully',
      taskId: req.params.id 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};