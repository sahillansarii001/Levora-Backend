import {  DataTypes  } from 'sequelize';
import sequelize from '../config/database.js';

const FeeRecord = sequelize.define('FeeRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
  paidDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending', 'overdue'),
    defaultValue: 'pending',
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
  },
  paymentGateway: {
    type: DataTypes.STRING,
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
  },
  receiptUrl: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'fee_records',
  timestamps: true,
});

export default FeeRecord;
