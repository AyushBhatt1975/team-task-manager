const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let projectId = '';
let taskId = '';

const testAPI = async () => {
  try {
    console.log('--- Starting Full Backend API Tests ---');

    // 1. Auth: Registration
    console.log('\n1. Testing Registration...');
    const email = `user_${Date.now()}@example.com`;
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Manager',
      email,
      password: 'password123'
    });
    console.log('✅ Registration successful');
    token = registerRes.data.data.token;

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Project: Create
    console.log('\n2. Testing Project Creation...');
    const projectRes = await axios.post(`${API_URL}/projects`, {
      name: 'Test Project',
      description: 'Test project description',
      priority: 'high',
      color: '#ff0000'
    }, { headers });
    console.log('✅ Project creation successful');
    projectId = projectRes.data.data.project.id;

    // 3. Project: Get All
    console.log('\n3. Testing Get All Projects...');
    const projectsRes = await axios.get(`${API_URL}/projects`, { headers });
    console.log(`✅ Fetched ${projectsRes.data.data.projects.length} projects`);

    // 4. Task: Create
    console.log('\n4. Testing Task Creation...');
    const taskRes = await axios.post(`${API_URL}/projects/${projectId}/tasks`, {
      title: 'Fix critical bug',
      description: 'A very important task',
      priority: 'critical',
      status: 'todo'
    }, { headers });
    console.log('✅ Task creation successful');
    taskId = taskRes.data.data.task.id;

    // 5. Task: Update Status
    console.log('\n5. Testing Task Status Update...');
    await axios.put(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
      status: 'in_progress'
    }, { headers });
    console.log('✅ Task status updated to in_progress');

    // 6. Comment: Add
    console.log('\n6. Testing Adding Comment...');
    const commentRes = await axios.post(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments`, {
      content: 'I am working on this now.'
    }, { headers });
    console.log('✅ Comment added successfully');

    // 7. Dashboard: Get Stats
    console.log('\n7. Testing Dashboard Stats...');
    const dashRes = await axios.get(`${API_URL}/dashboard`, { headers });
    console.log('✅ Dashboard stats fetched:', JSON.stringify(dashRes.data.data.stats));

    console.log('\n--- All Backend API Tests Passed! ---');
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

testAPI();
