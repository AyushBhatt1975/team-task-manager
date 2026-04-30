const { ProjectMember } = require('../models');

// Check if user is a member of the project
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user.id;

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project'
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

// Check if user is an admin of the project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user.id;

    const membership = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this project'
      });
    }

    if (membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin role required'
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireProjectMember, requireProjectAdmin };
