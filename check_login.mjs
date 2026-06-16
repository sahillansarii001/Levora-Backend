import fetch from 'node-fetch';

async function test() {
  // 1. Login as faculty
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'kiyer@levora.edu', password: 'password' }) // Wait, what's the password?
  });
  
  const loginData = await loginRes.json();
  console.log('Login Data:', loginData);
}

test();
