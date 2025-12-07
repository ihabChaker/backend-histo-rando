'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('points_of_interest', 'treasureHuntId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'treasure_hunts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('points_of_interest', 'treasureHuntId');
  },
};
