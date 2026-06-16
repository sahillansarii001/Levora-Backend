import jwt from 'jsonwebtoken';

const payload = {
  id: '123',
  email: 'kiyer@levora.edu',
  role: 'faculty',
  name: 'Mr. K. Iyer',
  className: undefined
};

const token = jwt.sign(payload, 'secret', { expiresIn: '15m' });
const decoded = jwt.verify(token, 'secret');
console.log('Decoded Payload:', decoded);
