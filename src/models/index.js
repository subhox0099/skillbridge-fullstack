const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const defineUser = require('./User');
const defineRole = require('./Role');
const defineCollege = require('./College');
const defineBusinessDetail = require('./BusinessDetail');
const defineSkill = require('./Skill');
const defineUserSkill = require('./UserSkill');
const defineProject = require('./Project');
const defineProjectSkill = require('./ProjectSkill');
const defineApplication = require('./Application');
const defineReview = require('./Review');
const definePayment = require('./Payment');
const defineNotification = require('./Notification');
const defineMessage = require('./Message');

// Initialize models
const User = defineUser(sequelize, Sequelize.DataTypes);
const Role = defineRole(sequelize, Sequelize.DataTypes);
const College = defineCollege(sequelize, Sequelize.DataTypes);
const BusinessDetail = defineBusinessDetail(sequelize, Sequelize.DataTypes);
const Skill = defineSkill(sequelize, Sequelize.DataTypes);
const UserSkill = defineUserSkill(sequelize, Sequelize.DataTypes);
const Project = defineProject(sequelize, Sequelize.DataTypes);
const ProjectSkill = defineProjectSkill(sequelize, Sequelize.DataTypes);
const Application = defineApplication(sequelize, Sequelize.DataTypes);
const Review = defineReview(sequelize, Sequelize.DataTypes);
const Payment = definePayment(sequelize, Sequelize.DataTypes);
const Notification = defineNotification(sequelize, Sequelize.DataTypes);
const Message = defineMessage(sequelize, Sequelize.DataTypes);

// Associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

College.hasMany(User, { foreignKey: 'college_id' });
User.belongsTo(College, { foreignKey: 'college_id' });

User.hasOne(BusinessDetail, { foreignKey: 'user_id' });
BusinessDetail.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Skill, { through: UserSkill, foreignKey: 'user_id' });
Skill.belongsToMany(User, { through: UserSkill, foreignKey: 'skill_id' });

User.hasMany(Project, { foreignKey: 'business_user_id' });
Project.belongsTo(User, { as: 'business', foreignKey: 'business_user_id' });

Project.belongsToMany(Skill, { through: ProjectSkill, foreignKey: 'project_id' });
Skill.belongsToMany(Project, { through: ProjectSkill, foreignKey: 'skill_id' });

Project.hasMany(Application, { foreignKey: 'project_id' });
Application.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(Application, { foreignKey: 'student_user_id' });
Application.belongsTo(User, { as: 'student', foreignKey: 'student_user_id' });

User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewer_id' });
Review.belongsTo(User, { as: 'reviewee', foreignKey: 'reviewee_id' });

Project.hasMany(Review, { foreignKey: 'project_id' });
Review.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Payment, { foreignKey: 'project_id' });
Payment.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Message, { foreignKey: 'sender_user_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipient_user_id', as: 'receivedMessages' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_user_id' });
Message.belongsTo(User, { as: 'recipient', foreignKey: 'recipient_user_id' });

Project.hasMany(Message, { foreignKey: 'project_id' });
Message.belongsTo(Project, { foreignKey: 'project_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Role,
  College,
  BusinessDetail,
  Skill,
  UserSkill,
  Project,
  ProjectSkill,
  Application,
  Review,
  Payment,
  Notification,
  Message,
};
