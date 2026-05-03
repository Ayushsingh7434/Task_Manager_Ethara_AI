/**
 * Task Routes
 * All routes require authentication (JWT)
 * Create and Delete are Admin only
 * Update is accessible to both Admin and Member (with restrictions)
 */

const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// GET /api/tasks/stats/overview - Dashboard statistics
// Must be defined BEFORE /:id to avoid conflict
router.get('/stats/overview', getTaskStats);

// GET  /api/tasks     - Get all tasks (filtered by role)
// POST /api/tasks     - Create a new task (Admin only)
router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

// GET    /api/tasks/:id - Get task by ID
// PUT    /api/tasks/:id - Update task (Admin: all fields, Member: status only)
// DELETE /api/tasks/:id - Delete task (Admin only)
router.route('/:id')
  .get(getTaskById)
  .put(updateTask) // Both roles, logic handled in controller
  .delete(authorize('admin'), deleteTask);

module.exports = router;
