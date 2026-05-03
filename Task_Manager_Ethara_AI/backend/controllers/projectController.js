/**
 * Project Controller
 * Handles CRUD operations for projects and member management
 */

const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Admin only)
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required.',
      });
    }

    // Validate that all provided member IDs exist in the database
    let validatedMembers = [];
    if (members && members.length > 0) {
      const users = await User.find({ _id: { $in: members } });
      validatedMembers = users.map((u) => u._id);
    }

    // Always include the creator as a member
    const allMembers = [...new Set([req.user._id.toString(), ...validatedMembers.map((m) => m.toString())])];

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || '',
      createdBy: req.user._id,
      members: allMembers,
    });

    // Populate member details before responding
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 *          - Admin: sees all projects
 *          - Member: sees only projects they are a member of
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    let query = {};

    // Members can only see projects they belong to
    if (req.user.role === 'member') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 }); // Newest first

    // Add task count to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        const completedTasks = await Task.countDocuments({
          projectId: project._id,
          status: 'completed',
        });
        return {
          ...project.toJSON(),
          taskCount,
          completedTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects: projectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'member' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project.',
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project's title or description
 * @access  Private (Admin only)
 */
const updateProject = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Update fields if provided
    if (title) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;

    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and all its tasks
 * @access  Private (Admin only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: project._id });

    // Delete the project itself
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and all its tasks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add a member to a project
 * @access  Private (Admin only)
 */
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project.',
      });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `${user.name} added to the project.`,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove a member from a project
 * @access  Private (Admin only)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const { userId } = req.params;

    // Prevent removing the project creator
    if (project.createdBy.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project creator.',
      });
    }

    // Filter out the user from members array
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed from project.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/users/all
 * @desc    Get all users (for admin to assign members)
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getAllUsers,
};
