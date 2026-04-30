const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';

const testAuth = async () => {
  try {
    console.log('--- Starting Backend Auth Tests ---');

    // 1. Test Registration
    console.log('\n1. Testing Registration...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('✅ Registration successful');
    token = registerRes.data.data.token;

    // 2. Test Login
    console.log('\n2. Testing Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: registerRes.data.data.user.email,
      password: 'password123'
    });
    console.log('✅ Login successful');
    token = loginRes.data.data.token;

    // 3. Test Get Me (Protected)
    console.log('\n3. Testing Get Me (Protected Route)...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Me successful:', meRes.data.data.user.name);

    // 4. Test Update Profile
    console.log('\n4. Testing Profile Update...');
    const updateRes = await axios.put(`${API_URL}/auth/profile`, 
      { name: 'Updated Name' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Profile Update successful:', updateRes.data.data.user.name);

    console.log('\n--- All Auth Tests Passed! ---');
  } catch (err) {
    console.error('\n❌ Test failed:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
};

testAuth();
