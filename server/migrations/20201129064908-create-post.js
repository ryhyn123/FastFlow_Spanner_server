'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
       inventionId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      onDelete: 'cascade',
      references: {
        model: 'inventions',
        key: 'id',
      },
      },
      userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      onDelete: 'cascade',
      references: {
        model: 'users',
        key: 'id',
      },
      },
      title: {
        type: Sequelize.STRING
      },
      text: {
        type: Sequelize.STRING
      },
      postPhoto: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
         defaultValue:Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
         defaultValue:Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('posts');
  }
};