const express = require('express');
const Task = require('../models/Task');
const { auth, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all tasks (with pagination and filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'User') {
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'Manager') {
      // Manager can see tasks they created or assigned? Let's say all for now, or just ones they manage.
      // Usually managers can see all tasks, or we can restrict. Let's let managers see all tasks in this simple system.
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);
    res.json({ tasks, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create task (Admin, Manager)
router.post('/', auth, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const task = new Task({ ...req.body, createdBy: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Users can only update status if it's assigned to them
    if (req.user.role === 'User') {
      if (task.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Users can only update status
      task.status = req.body.status || task.status;
    } else {
      // Admin and Manager can update everything
      Object.assign(task, req.body);
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete task (Admin, Manager)
router.delete('/:id', auth, authorizeRoles('Admin', 'Manager'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
