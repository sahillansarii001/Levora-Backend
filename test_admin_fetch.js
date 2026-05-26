import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign({ id: 'dummy_superadmin', role: 'superadmin' }, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production', { expiresIn: '1h' });

fetch('http://localhost:5000/api/cms/courses', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.text().then(text => ({ status: res.status, body: text })))
.then(data => console.log('Response:', data))
.catch(err => console.error('Fetch error:', err));
