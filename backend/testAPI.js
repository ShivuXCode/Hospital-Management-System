const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Generate token for Dr. Karan
const token = jwt.sign(
  { id: '6900e5e94ee1f47953b48aba', role: 'Doctor' },
  'your-secret-key-here'
);

console.log('Testing /api/messages/participants endpoint for Dr. Karan...\n');
console.log('Token:', token, '\n');

fetch('http://localhost:5000/api/messages/participants', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Response received:\n');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n📊 Summary:');
  console.log('- Nurses count:', data.participants?.nurses?.length || 0);
  console.log('- Admins count:', data.participants?.admins?.length || 0);
  if (data.participants?.nurses) {
    console.log('\n👩‍⚕️ Nurses returned:');
    data.participants.nurses.forEach(n => {
      console.log(`  - ${n.name} (${n.email})`);
    });
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
});
