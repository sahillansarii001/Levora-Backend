import fetch from 'node-fetch';

async function testChat() {
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello' }]
    })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testChat();
