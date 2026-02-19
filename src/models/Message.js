module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sender_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    recipient_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
    
  });

  return Message;
};

