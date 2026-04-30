const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');
const {
  createProject, getProjects, getProject, updateProject,
  deleteProject, addMember, updateMemberRole, removeMember
} = require('../controllers/projectController');
const {
  createTask, getTasks, getTask, updateTask, deleteTask, addComment, deleteComment
} = require('../controllers/taskController');

// Project CRUD
router.get('/', authenticate, getProjects);
router.post('/', authenticate, createProject);
router.get('/:projectId', authenticate, requireProjectMember, getProject);
router.put('/:projectId', authenticate, requireProjectAdmin, updateProject);
router.delete('/:projectId', authenticate, requireProjectAdmin, deleteProject);

// Member management (admin only)
router.post('/:projectId/members', authenticate, requireProjectAdmin, addMember);
router.put('/:projectId/members/:userId', authenticate, requireProjectAdmin, updateMemberRole);
router.delete('/:projectId/members/:userId', authenticate, requireProjectAdmin, removeMember);

// Task routes (nested under project)
router.get('/:projectId/tasks', authenticate, requireProjectMember, getTasks);
router.post('/:projectId/tasks', authenticate, requireProjectMember, createTask);
router.get('/:projectId/tasks/:taskId', authenticate, requireProjectMember, getTask);
router.put('/:projectId/tasks/:taskId', authenticate, requireProjectMember, updateTask);
router.delete('/:projectId/tasks/:taskId', authenticate, requireProjectMember, deleteTask);

// Comment routes
router.post('/:projectId/tasks/:taskId/comments', authenticate, requireProjectMember, addComment);
router.delete('/:projectId/tasks/:taskId/comments/:commentId', authenticate, requireProjectMember, deleteComment);

module.exports = router;
