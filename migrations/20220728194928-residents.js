'use strict';

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'Residents', // table name
        'gender', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
          after: 'Name',
        },
      ),
      queryInterface.addColumn(
        'Residents',
        'priority',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          after: 'RoomNum',
        },
      ),
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('Residents', 'gender'),
      queryInterface.removeColumn('Residents', 'priority'),
    ]);
  },
};
