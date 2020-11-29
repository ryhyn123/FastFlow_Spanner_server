'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
           models.post.belongsTo(models.user, {
      foreignKey: 'userId',
    });
        models.post.belongsTo(models.invention, {
      foreignKey: 'inventionId',
    });
    }
  };
  post.init({
    title: DataTypes.STRING,
    text: DataTypes.STRING,
    postPhoto: DataTypes.STRING,
        createdAt:{type:DataTypes.INTEGER, defaultValue: sequelize.fn('NOW')},
    updatedAt:{type:DataTypes.INTEGER,  defaultValue: sequelize.fn('NOW')} 

  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};