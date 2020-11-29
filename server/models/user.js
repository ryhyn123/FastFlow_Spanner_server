'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       models.user.hasMany(models.post, {
      foreignKey: 'userId',
    });
    }
  };
  user.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    userPhoto: DataTypes.STRING,
    is_social: DataTypes.BOOLEAN,
    is_active: DataTypes.BOOLEAN,
        createdAt:{type:DataTypes.INTEGER, defaultValue: sequelize.fn('NOW')},
    updatedAt:{type:DataTypes.INTEGER,  defaultValue: sequelize.fn('NOW')} 

  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};