/**
 * Task Controller
 * Handles CRUD operations for tasks within projects
 */

const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @route   POST /api/tasks
 * @desc    Create a new task in a project
 * @access  Private (Admin only)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, priority, deadline } = req.body;

    // Validate required fields
    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project ID are required.',
      });
    }

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // If assignedTo is provided, verify user is a member of the project
    if (assignedTo) {
      const isMember = project.members.some(
        (memberId) => memberId.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project.',
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
    });

    // Populate user details for the response
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'title');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with optional filtering
 *          - Admin: all tasks (with optional projectId filter)
 *          - Member: only tasks assigned to them
 * @access  Private
 * @query   projectId, status, priority, overdue
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, overdue } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'member') {
      // Members see tasks assigned to them
      query.assignedTo = req.user._id;
    }

    // Apply optional filters
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Filter overdue tasks: deadline passed and not completed
    if (overdue === 'true') {
      query.deadline = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    // Add isOverdue flag to each task
    const tasksWithOverdue = tasks.map((task) => ({
      ...task.toJSON(),
      isOverdue:
        task.deadline &&
        task.status !== 'completed' &&
        new Date() > new Date(task.deadline),
    }));

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks: tasksWithOverdue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'title description');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Members can only view tasks assigned to them
    if (
      req.user.role === 'member' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.status(200).json({
      success: true,
      task: {
        ...task.toJSON(),
        isOverdue:
          task.deadline &&
          task.status !== 'completed' &&
          new Date() > new Date(task.deadline),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 *          - Admin: can update all fields
 *          - Member: can only update status
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    if (req.user.role === 'member') {
      // Members can only update status of tasks assigned to them
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you.',
        });
      }

      // Members can only change the status field
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status.',
        });
      }
    } else {
      // Admin can update all fields
      const { title, description, assignedTo, status, priority, deadline } = req.body;

      if (title) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'title');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: {
        ...task.toJSON(),
        isOverdue:
          task.deadline &&
          task.status !== 'completed' &&
          new Date() > new Date(task.deadline),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Admin only)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/stats/overview
 * @desc    Get task statistics for dashboard
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    // Members see stats for their tasks only
    if (req.user.role === 'member') {
      matchQuery.assignedTo = req.user._id;
    }

    const [total, pending, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, status: 'pending' }),
      Task.countDocuments({ ...matchQuery, status: 'in_progress' }),
      Task.countDocuments({ ...matchQuery, status: 'completed' }),
      Task.countDocuments({
        ...matchQuery,
        deadline: { $lt: new Date() },
        status: { $ne: 'completed' },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        completed,
        overdue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};
