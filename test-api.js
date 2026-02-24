// Test API endpoints
const http = require('http');

const baseURL = 'http://localhost:7777';

// Test helper function
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API Endpoints\n');

  try {
    // Test 1: Signup
    console.log('1️⃣  Testing POST /signup');
    const signupRes = await makeRequest('POST', '/signup', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      gender: 'male',
      skills: ['JavaScript', 'Node.js'],
      about: 'Test user',
      photoUrl: 'https://example.com/photo.jpg'
    });
    console.log(`Status: ${signupRes.status}`);
    console.log(`Response:`, signupRes.body);
    console.log('');

    // Test 2: Login
    console.log('2️⃣  Testing POST /login');
    const loginRes = await makeRequest('POST', '/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, loginRes.body);
    const token = loginRes.headers['set-cookie'];
    console.log(`Token Set:`, token ? 'Yes ✅' : 'No ❌');
    console.log('');

    // Test 3: Forgot Password
    console.log('3️⃣  Testing POST /forgot-password');
    const forgotRes = await makeRequest('POST', '/forgot-password', {
      email: 'test@example.com'
    });
    console.log(`Status: ${forgotRes.status}`);
    console.log(`Response:`, forgotRes.body);
    const resetToken = forgotRes.body.resetToken;
    console.log('');

    // Test 4: Profile Edit (requires auth)
    console.log('4️⃣  Testing PATCH /profile/edit');
    const editRes = await makeRequest('PATCH', '/profile/edit', {
      firstName: 'Updated',
      about: 'Updated bio'
    }, {
      'Cookie': token ? token[0] : ''
    });
    console.log(`Status: ${editRes.status}`);
    console.log(`Response:`, editRes.body);
    console.log('');

    // Test 5: Change Password (requires auth)
    console.log('5️⃣  Testing PATCH /profile/password');
    const passwordRes = await makeRequest('PATCH', '/profile/password', {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    }, {
      'Cookie': token ? token[0] : ''
    });
    console.log(`Status: ${passwordRes.status}`);
    console.log(`Response:`, passwordRes.body);
    console.log('');

    // Test 6: Reset Password
    console.log('6️⃣  Testing POST /reset-password');
    const resetRes = await makeRequest('POST', '/reset-password', {
      token: resetToken,
      newPassword: 'resetpassword123',
      confirmPassword: 'resetpassword123'
    });
    console.log(`Status: ${resetRes.status}`);
    console.log(`Response:`, resetRes.body);
    console.log('');

    console.log('✅ All tests completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

runTests();
