'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BodyTemperature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BodyTemperature.init({
    BodyTemperature: DataTypes.STRING,
    PatientId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BodyTemperature',
  });
  return BodyTemperature;
};