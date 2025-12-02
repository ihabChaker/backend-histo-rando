-- Create Admin Account for HistoRando
-- This script creates an admin user for the HistoRando platform
-- Password: Admin123! (hashed with bcrypt)

-- First, ensure you're using the correct database
USE histo_rando;

-- Create admin user
-- Note: The password hash is for "Admin123!" 
-- If you need a different password, register a user via API first, then update the role

INSERT INTO users (
  username,
  email,
  passwordHash,
  firstName,
  lastName,
  isPmr,
  totalPoints,
  totalKm,
  role,
  registrationDate,
  updatedAt,
  createdAt
) VALUES (
  'admin',
  'admin@histo-rando.com',
  -- Password: Admin123!
  -- You'll need to generate this hash by registering first via API
  '$2b$10$YourBcryptHashHere',
  'Admin',
  'User',
  false,
  0,
  0.00,
  'admin',
  NOW(),
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE role = 'admin';

-- Alternative: Update existing user to admin
-- If you already have a user, you can promote them to admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify the admin account was created
SELECT id, username, email, role, registrationDate 
FROM users 
WHERE role = 'admin';
