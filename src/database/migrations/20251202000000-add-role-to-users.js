'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if role column already exists
    const table = await queryInterface.describeTable('Users');

    if (!table.role) {
      console.log('Adding role column to Users table...');
      // Add role column to Users table
      await queryInterface.addColumn('Users', 'role', {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      });

      // Add index for role column for better query performance
      await queryInterface.addIndex('Users', ['role']);
      console.log('✅ Role column added successfully');
    } else {
      console.log('⏭️  Role column already exists, skipping...');
    }

    // Rename password to passwordHash if it exists
    if (table.password && !table.passwordHash) {
      console.log('Renaming password column to passwordHash...');
      await queryInterface.renameColumn('Users', 'password', 'passwordHash');
      console.log('✅ Column renamed successfully');
    } else if (table.passwordHash) {
      console.log('⏭️  passwordHash column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    // Rename passwordHash back to password if needed
    if (table.passwordHash && !table.password) {
      await queryInterface.renameColumn('Users', 'passwordHash', 'password');
    }

    // Remove the role column if it exists
    if (table.role) {
      // Remove the index first
      await queryInterface.removeIndex('Users', ['role']);

      // Remove the role column
      await queryInterface.removeColumn('Users', 'role');
    }
  },
};
