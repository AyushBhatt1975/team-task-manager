const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Task, Project, ProjectMember, User } = require('../models');

// @desc    Get dashboard stats for current user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Projects user is member of
    const memberships = await ProjectMember.findAll({ where: { userId } });
    const projectIds = memberships.map(m => m.projectId);

    // My tasks across all projects
    const myTasks = await Task.findAll({
      where: { assigneeId: userId },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] }
      ],
      order: [['dueDate', 'ASC']]
    });

    // Stats
    const totalTasks = myTasks.length;
    const doneTasks = myTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = myTasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = myTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < today && t.status !== 'done'
    ).length;

    // Due soon (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueSoon = myTasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) >= today &&
      new Date(t.dueDate) <= nextWeek &&
      t.status !== 'done'
    );

    // Overdue tasks list
    const overdueList = myTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < today && t.status !== 'done'
    );

    // Recent tasks (last 10)
    const recentTasks = myTasks.slice(0, 10);

    // Project stats
    const projects = await Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      attributes: ['id', 'name', 'color', 'status']
    });

    const projectStats = await Promise.all(projects.map(async (proj) => {
      const tasks = await Task.findAll({ where: { projectId: proj.id }, attributes: ['status'] });
      const counts = { total: tasks.length, done: 0, in_progress: 0, todo: 0, in_review: 0 };
      tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
      const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
      return { ...proj.toJSON(), taskCounts: counts, progress };
    }));

    // Tasks by status breakdown
    const allProjectTasks = await Task.findAll({
      where: { projectId: { [Op.in]: projectIds } },
      attributes: ['status']
    });

    const statusBreakdown = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
    allProjectTasks.forEach(t => { statusBreakdown[t.status] = (statusBreakdown[t.status] || 0) + 1; });

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects: projectIds.length,
          totalTasks,
          doneTasks,
          inProgressTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
        },
        dueSoon,
        overdueList,
        recentTasks,
        projectStats,
        statusBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (for member search)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { isActive: true };
    if (search) {
      const isPostgres = User.sequelize.options.dialect === 'postgres';
      const likeOp = isPostgres ? Op.iLike : Op.like;
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } }
      ];
    }
    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'avatar'],
      limit: 20
    });
    res.json({ success: true, data: { users } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getUsers };
