#!/usr/bin/env node

/**
 * Script to create an admin account
 * Usage: node scripts/create-admin.js
 */

const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const API_URL = process.env.API_URL || 'https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'histo_rando',
};

// Admin account details
const ADMIN_ACCOUNT = {
  username: 'admin',
  email: 'admin@histo-rando.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
};

async function createAdminAccount() {
  console.log('🚀 Creating admin account...\n');

  try {
    // Step 1: Register user via API
    console.log('📝 Step 1: Registering user via API...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
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

    // Step 2: Update user role to admin in database
    console.log('\n🔧 Step 2: Updating user role to admin...');
    const connection = await mysql.createConnection(DB_CONFIG);

    await connection.execute(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', ADMIN_ACCOUNT.email]
    );

    // Verify the update
    const [rows] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE email = ?',
      [ADMIN_ACCOUNT.email]
    );

    await connection.end();

    console.log('✅ User role updated to admin');
    console.log('\n📊 Admin Account Details:');
    console.log('─────────────────────────────────────');
    console.log(`   ID:       ${rows[0].id}`);
    console.log(`   Username: ${rows[0].username}`);
    console.log(`   Email:    ${rows[0].email}`);
    console.log(`   Role:     ${rows[0].role}`);
    console.log(`   Password: ${ADMIN_ACCOUNT.password}`);
    console.log('─────────────────────────────────────');

    // Step 3: Test admin login
    console.log('\n🔐 Step 3: Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
    });

    console.log('✅ Admin login successful');
    console.log(`   Token: ${loginResponse.data.access_token.substring(0, 50)}...`);

    // Step 4: Verify admin access
    console.log('\n✨ Step 4: Verifying admin access...');
    const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.access_token}`,
      },
    });

    console.log('✅ Admin dashboard access verified');
    console.log(`   Total Users: ${statsResponse.data.users.total}`);
    console.log(`   Total Parcours: ${statsResponse.data.content.parcours.total}`);

    console.log('\n🎉 Admin account created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('─────────────────────────────────────');
    console.log(`   Email:    ${ADMIN_ACCOUNT.email}`);
    console.log(`   Password: ${ADMIN_ACCOUNT.password}`);
    console.log('─────────────────────────────────────');
    console.log('\n🌐 Access the admin dashboard at:');
    console.log(`   Backend API: ${API_URL}`);
    console.log(`   Admin Endpoints: ${API_URL}/admin/*`);

  } catch (error) {
    if (error.response) {
      // API error
      if (error.response.status === 409 || error.response.data?.message?.includes('already exists')) {
        console.log('\n⚠️  User already exists. Updating role to admin...');
        
        try {
          const connection = await mysql.createConnection(DB_CONFIG);
          await connection.execute(
            'UPDATE users SET role = ? WHERE email = ?',
            ['admin', ADMIN_ACCOUNT.email]
          );
          
          const [rows] = await connection.execute(
            'SELECT id, username, email, role FROM users WHERE email = ?',
            [ADMIN_ACCOUNT.email]
          );
          
          await connection.end();
          
          console.log('✅ User role updated to admin');
          console.log('\n📊 Admin Account Details:');
          console.log('─────────────────────────────────────');
          console.log(`   ID:       ${rows[0].id}`);
          console.log(`   Username: ${rows[0].username}`);
          console.log(`   Email:    ${rows[0].email}`);
          console.log(`   Role:     ${rows[0].role}`);
          console.log(`   Password: ${ADMIN_ACCOUNT.password} (if unchanged)`);
          console.log('─────────────────────────────────────');
          
          console.log('\n🎉 Admin account ready!');
        } catch (dbError) {
          console.error('❌ Database error:', dbError.message);
          process.exit(1);
        }
      } else {
        console.error('❌ API Error:', error.response.data);
        process.exit(1);
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to API server');
      console.error(`   Make sure the backend is running at ${API_URL}`);
      console.error('   Start it with: npm run start:dev');
      process.exit(1);
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Run the script
createAdminAccount();
