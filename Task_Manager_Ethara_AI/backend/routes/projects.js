/**
 * Project Routes
 * All routes require authentication (JWT)
 * Admin-only routes are further protected with authorize('admin')
 */

const express = require('express');
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getAllUsers,
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

// All project routes require authentication
router.use(protect);

// GET /api/projects/users/all - Get all users (Admin only)
// Must be defined BEFORE /:id routes to avoid conflict
router.get('/users/all', authorize('admin'), getAllUsers);

// GET  /api/projects     - Get all projects
// POST /api/projects     - Create a new project (Admin only)
router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

// GET    /api/projects/:id - Get project by ID
// PUT    /api/projects/:id - Update project (Admin only)
// DELETE /api/projects/:id - Delete project (Admin only)
router.route('/:id')
  .get(getProjectById)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

// POST   /api/projects/:id/members          - Add member (Admin only)
// DELETE /api/projects/:id/members/:userId  - Remove member (Admin only)
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
