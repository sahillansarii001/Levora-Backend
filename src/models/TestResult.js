import {  DataTypes  } from 'sequelize';
import sequelize from '../config/database.js';

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  totalMarks: {
    type: DataTypes.INTEGER,
  },
  percentile: {
    type: DataTypes.DECIMAL(5, 2),
  },
  rank: {
    type: DataTypes.INTEGER,
  },
  attemptedAt: {
    type: DataTypes.DATE,
  },
  timeTaken: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'test_results',
  timestamps: true,
});

export default TestResult;
