const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title is required' },
      len: { args: [2, 200], msg: 'Title must be 2-200 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'in_review', 'done'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  estimatedHours: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assigneeId: {
    type: DataTypes.UUID,
    defaultValue: null
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tags: {
    type: sequelize.options.dialect === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.TEXT,
    defaultValue: sequelize.options.dialect === 'postgres' ? [] : '',
    get() {
      const val = this.getDataValue('tags');
      if (sequelize.options.dialect === 'postgres') return val || [];
      return val ? val.split(',') : [];
    },
    set(val) {
      if (sequelize.options.dialect === 'postgres') {
        this.setDataValue('tags', val);
      } else {
        this.setDataValue('tags', Array.isArray(val) ? val.join(',') : val);
      }
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Task;
