/**
 * Ensures latitude/longitude columns exist on users and projects tables.
 * Safe to run on every startup; skips adding if columns already exist.
 */
const { DataTypes } = require('sequelize');

async function ensureGeoColumns(sequelize) {
  const qi = sequelize.getQueryInterface();
  const decimalLat = { type: DataTypes.DECIMAL(10, 8), allowNull: true };
  const decimalLon = { type: DataTypes.DECIMAL(11, 8), allowNull: true };

  for (const table of ['users', 'projects']) {
    const desc = await qi.describeTable(table);
    if (!desc.latitude) {
      await qi.addColumn(table, 'latitude', decimalLat);
    }
    if (!desc.longitude) {
      await qi.addColumn(table, 'longitude', decimalLon);
    }
  }
}

module.exports = { ensureGeoColumns };
