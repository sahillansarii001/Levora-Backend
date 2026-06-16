import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const secret = process.env.JWT_SECRET || 'secret';
  
  // Generate a valid faculty token
  const payload = {
    id: '6a1676c0236b1e9ccdca0401', // Mr K Iyer id
    email: 'kiyer@levora.edu',
    role: 'faculty',
    name: 'Mr. K. Iyer'
  };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  
  console.log('Generated token:', token);
  
  const res = await fetch('http://localhost:5000/api/assignments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Test Assignment',
      subject: 'Computer Science',
      className: 'Batch A',
      dueDate: '2026-12-31'
    })
  });
  
  const data = await res.json();
  console.log('Response:', data);
}

test();
