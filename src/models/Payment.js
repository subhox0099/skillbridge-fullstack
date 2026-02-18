module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'RELEASED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    simulated: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  return Payment;
};
