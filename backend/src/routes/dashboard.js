const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getDashboard, getUsers } = require('../controllers/dashboardController');

router.get('/', authenticate, getDashboard);
router.get('/users', authenticate, getUsers);

module.exports = router;
