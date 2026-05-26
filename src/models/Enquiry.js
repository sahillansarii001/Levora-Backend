import {  DataTypes  } from 'sequelize';
import sequelize from '../config/database.js';

const Enquiry = sequelize.define('Enquiry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  courseInterest: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'resolved', 'ignored'),
    defaultValue: 'new',
  },
}, {
  tableName: 'enquiries',
  timestamps: true,
});

export default Enquiry;
