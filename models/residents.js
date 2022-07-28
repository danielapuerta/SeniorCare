'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Residents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Residents.init({
    Name: DataTypes.STRING,
    Gender: DataTypes.STRING, //updated
    age: DataTypes.INTEGER,
    RoomNum: DataTypes.STRING,
    Priority: DataTypes.INTEGER //updated
  }, {
    sequelize,
    modelName: 'Residents',
  });
  return Residents;
};