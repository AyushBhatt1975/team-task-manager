const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' },
      len: { args: [2, 150], msg: 'Project name must be 2-150 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('active', 'on_hold', 'completed', 'archived'),
    defaultValue: 'active'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6366f1'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Project;
