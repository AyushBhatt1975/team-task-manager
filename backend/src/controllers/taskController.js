const { Op } = require('sequelize');
const { Task, User, Project, ProjectMember, Comment } = require('../models');

// @desc    Create task
// @route   POST /api/projects/:projectId/tasks
// @access  Private (member)
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, estimatedHours, tags } = req.body;

    // Verify assignee is a project member (if provided)
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId: req.params.projectId, userId: assigneeId }
      });
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assignee must be a project member' });
      }
    }

    const task = await Task.create({
      title, description, status, priority, dueDate, assigneeId,
      estimatedHours, tags: tags || [],
      projectId: req.params.projectId,
      creatorId: req.user.id
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    res.status(201).json({ success: true, message: 'Task created', data: { task: fullTask } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (member)
const getTasks = async (req, res) => {
  try {
    const { status, priority, assigneeId, search } = req.query;
    const where = { projectId: req.params.projectId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      const isPostgres = Task.sequelize.options.dialect === 'postgres';
      where.title = { [isPostgres ? Op.iLike : Op.like]: `%${search}%` };
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: { tasks } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/projects/:projectId/tasks/:taskId
// @access  Private (member)
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.taskId, projectId: req.params.projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, data: { task } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:taskId
// @access  Private (member)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.taskId, projectId: req.params.projectId }
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { title, description, status, priority, dueDate, assigneeId, estimatedHours, tags } = req.body;

    // Set completedAt timestamp when marking done
    const updates = { title, description, status, priority, dueDate, assigneeId, estimatedHours, tags };
    if (status === 'done' && task.status !== 'done') {
      updates.completedAt = new Date();
    } else if (status && status !== 'done') {
      updates.completedAt = null;
    }

    await task.update(updates);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] }
      ]
    });

    res.json({ success: true, message: 'Task updated', data: { task: updatedTask } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/projects/:projectId/tasks/:taskId
// @access  Private (admin or creator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.taskId, projectId: req.params.projectId }
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isAdmin = req.membership.role === 'admin';
    const isCreator = task.creatorId === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Only admins or task creators can delete tasks' });
    }

    await task.destroy();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/projects/:projectId/tasks/:taskId/comments
// @access  Private (member)
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findOne({
      where: { id: req.params.taskId, projectId: req.params.projectId }
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const comment = await Comment.create({
      content,
      taskId: task.id,
      authorId: req.user.id
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] }]
    });

    res.status(201).json({ success: true, message: 'Comment added', data: { comment: fullComment } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/projects/:projectId/tasks/:taskId/comments/:commentId
// @access  Private (author or admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isAdmin = req.membership.role === 'admin';
    const isAuthor = comment.authorId === req.user.id;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await comment.destroy();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, addComment, deleteComment };
