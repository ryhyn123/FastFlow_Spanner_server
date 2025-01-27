'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class invention extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       models.invention.hasMany(models.post, {
      foreignKey: 'inventionId',
    });
    }
  };
  invention.init({
    title: DataTypes.STRING,
    text: DataTypes.STRING,
    inventionPhoto: DataTypes.STRING,
        createdAt:{type:DataTypes.INTEGER, defaultValue: sequelize.fn('NOW')},
    updatedAt:{type:DataTypes.INTEGER,  defaultValue: sequelize.fn('NOW')} 

  }, {
    sequelize,
    modelName: 'invention',
  });
  return invention;
};