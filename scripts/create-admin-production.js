#!/usr/bin/env node

/**
 * Create Admin Account - Production Version
 * This script creates an admin account on the production environment
 * Usage: node scripts/create-admin-production.js
 */

const https = require('https');

const API_URL = 'https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1';
const API_HOST = 'histo-rando-backend-egvh3.ondigitalocean.app';

// Admin account details
const ADMIN_ACCOUNT = {
  username: 'admin',
  email: 'admin@histo-rando.com',
  password: 'Admin123!SecurePassword',
  firstName: 'Admin',
  lastName: 'User',
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_HOST,
      port: 443,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: response });
          } else {
            reject({ statusCode: res.statusCode, data: response });
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function createAdminAccount() {
  console.log('🚀 Creating admin account on production...\n');
  console.log('🌐 API URL:', API_URL);
  console.log('');

  try {
    // Step 1: Register user via API
    console.log('📝 Step 1: Registering user via API...');
    const registerResponse = await makeRequest('POST', '/auth/register', {
      username: ADMIN_ACCOUNT.username,
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
      firstName: ADMIN_ACCOUNT.firstName,
      lastName: ADMIN_ACCOUNT.lastName,
    });

    console.log('✅ User registered successfully');
    console.log(`   User ID: ${registerResponse.data.user.id}`);
    console.log(`   Username: ${registerResponse.data.user.username}`);
    console.log(`   Email: ${registerResponse.data.user.email}`);

    // Step 2: Login to verify account works
    console.log('\n🔐 Step 2: Testing login...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
    });

    console.log('✅ Login successful');
    const token = loginResponse.data.access_token;
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Step 3: Display instructions for promoting to admin
    console.log('\n⚠️  IMPORTANT: Manual Step Required');
    console.log('─────────────────────────────────────────────────────');
    console.log('The user has been created but needs to be promoted to admin.');
    console.log('Please ask your database administrator or DevOps team to run:');
    console.log('');
    console.log('SQL Command:');
    console.log(`  UPDATE users SET role = 'admin' WHERE email = '${ADMIN_ACCOUNT.email}';`);
    console.log('');
    console.log('After the SQL command is executed, the admin account will be ready.');
    console.log('─────────────────────────────────────────────────────');

    console.log('\n📝 Account Details:');
    console.log('─────────────────────────────────────────');
    console.log(`   Email:    ${ADMIN_ACCOUNT.email}`);
    console.log(`   Password: ${ADMIN_ACCOUNT.password}`);
    console.log(`   User ID:  ${registerResponse.data.user.id}`);
    console.log('─────────────────────────────────────────');

    console.log('\n🌐 Production URLs:');
    console.log(`   API Base:  ${API_URL}`);
    console.log(`   Swagger:   ${API_URL.replace('/api/v1', '')}/api/docs`);
    console.log(`   Health:    ${API_URL}/health`);

    console.log('\n✅ Account created successfully!');
    console.log('\n⏳ Waiting for admin role to be assigned via database...');

  } catch (error) {
    if (error.statusCode) {
      if (error.statusCode === 409 || error.data?.message?.includes('already exists')) {
        console.log('\n⚠️  User already exists!');
        console.log('\n📝 Existing Account Details:');
        console.log('─────────────────────────────────────────');
        console.log(`   Email:    ${ADMIN_ACCOUNT.email}`);
        console.log(`   Password: ${ADMIN_ACCOUNT.password}`);
        console.log('─────────────────────────────────────────');
        
        console.log('\nIf you need to promote this user to admin, run this SQL:');
        console.log(`  UPDATE users SET role = 'admin' WHERE email = '${ADMIN_ACCOUNT.email}';`);
        
        // Try to login with existing account
        try {
          console.log('\n🔐 Testing login with existing account...');
          const loginResponse = await makeRequest('POST', '/auth/login', {
            email: ADMIN_ACCOUNT.email,
            password: ADMIN_ACCOUNT.password,
          });
          console.log('✅ Login successful');
          console.log(`   Token: ${loginResponse.data.access_token.substring(0, 50)}...`);
        } catch (loginError) {
          console.log('\n❌ Login failed. The password may have been changed.');
          console.log('If you forgot the password, please reset it via the database.');
        }
      } else {
        console.error('\n❌ API Error:', error.data);
        console.error('Status:', error.statusCode);
        process.exit(1);
      }
    } else {
      console.error('\n❌ Cannot connect to production API');
      console.error(`   URL: ${API_URL}`);
      console.error('   Error:', error.message || error);
      console.error('   Please check if the backend is deployed and accessible.');
      process.exit(1);
    }
  }
}

// Display warning
console.log('\n⚠️  WARNING: Production Environment');
console.log('════════════════════════════════════════════════════════');
console.log('This script will create an admin account on PRODUCTION.');
console.log('Make sure you have the necessary permissions to do this.');
console.log('════════════════════════════════════════════════════════\n');

// Run the script
createAdminAccount();
