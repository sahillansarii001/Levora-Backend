import {  DataTypes  } from 'sequelize';
import sequelize from '../config/database.js';

const Test = sequelize.define('Test', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  negativeMarking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  scheduledAt: {
    type: DataTypes.DATE,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'tests',
  timestamps: true,
});

export default Test;
