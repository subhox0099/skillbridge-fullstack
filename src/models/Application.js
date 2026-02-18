module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    student_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'APPLIED',
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Application;
};
