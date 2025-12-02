-- Promote user to admin role
-- Run this in your DigitalOcean MySQL console or via mysql CLI

-- Update the user role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@histo-rando.com';

-- Verify the update
SELECT id, username, email, role, created_at 
FROM users 
WHERE email = 'admin@histo-rando.com';
