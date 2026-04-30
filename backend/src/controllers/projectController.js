const { Op } = require('sequelize');
const { Project, ProjectMember, User, Task } = require('../models');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, status, priority, startDate, dueDate, color } = req.body;

    const project = await Project.create({
      name, description, status, priority, startDate, dueDate, color,
      ownerId: req.user.id
    });

    // Auto-add creator as admin
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin'
    });

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } }
      ]
    });

    res.status(201).json({ success: true, message: 'Project created', data: { project: fullProject } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all user's projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Get project IDs user is member of
    const memberships = await ProjectMember.findAll({ where: { userId: req.user.id } });
    const projectIds = memberships.map(m => m.projectId);

    const where = { id: { [Op.in]: projectIds } };
    if (status) where.status = status;
    if (search) {
      const isPostgres = Project.sequelize.options.dialect === 'postgres';
      where.name = { [isPostgres ? Op.iLike : Op.like]: `%${search}%` };
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role'] } }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add task counts
    const projectsWithCounts = await Promise.all(projects.map(async (project) => {
      const taskCounts = await Task.findAll({
        where: { projectId: project.id },
        attributes: ['status'],
      });
      const counts = { total: taskCounts.length, todo: 0, in_progress: 0, in_review: 0, done: 0 };
      taskCounts.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
      const userRole = memberships.find(m => m.projectId === project.id)?.role;
      return { ...project.toJSON(), taskCounts: counts, userRole };
    }));

    res.json({ success: true, data: { projects: projectsWithCounts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:projectId
// @access  Private (member)
const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'avatar'], through: { attributes: ['role', 'joinedAt'] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: { project, userRole: req.membership.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:projectId
// @access  Private (admin)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { name, description, status, priority, startDate, dueDate, color } = req.body;
    await project.update({ name, description, status, priority, startDate, dueDate, color });

    res.json({ success: true, message: 'Project updated', data: { project } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:projectId
// @access  Private (admin/owner)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only owner can delete the project' });
    }

    await project.destroy();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:projectId/members
// @access  Private (admin)
const addMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await ProjectMember.findOne({
      where: { projectId: req.params.projectId, userId: user.id }
    });
    if (existing) return res.status(400).json({ success: false, message: 'User is already a member' });

    await ProjectMember.create({
      projectId: req.params.projectId,
      userId: user.id,
      role
    });

    res.status(201).json({ success: true, message: `${user.name} added as ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update member role
// @route   PUT /api/projects/:projectId/members/:userId
// @access  Private (admin)
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const membership = await ProjectMember.findOne({
      where: { projectId: req.params.projectId, userId: req.params.userId }
    });
    if (!membership) return res.status(404).json({ success: false, message: 'Member not found' });

    await membership.update({ role });
    res.json({ success: true, message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:projectId/members/:userId
// @access  Private (admin)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (project.ownerId === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner' });
    }

    const membership = await ProjectMember.findOne({
      where: { projectId: req.params.projectId, userId: req.params.userId }
    });
    if (!membership) return res.status(404).json({ success: false, message: 'Member not found' });

    await membership.destroy();
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createProject, getProjects, getProject, updateProject,
  deleteProject, addMember, updateMemberRole, removeMember
};
