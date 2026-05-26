import {  DataTypes  } from 'sequelize';
import sequelize from '../config/database.js';

const Admission = sequelize.define('Admission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  documents: {
    type: DataTypes.JSON,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'admissions',
  timestamps: true,
});

export default Admission;
