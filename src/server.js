const dotenv = require('dotenv');
const app = require('./app');
const { sequelize } = require('./models');
const { seedDefaultRoles } = require('./config/seedRoles');

dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedDefaultRoles();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`SkillBridge backend listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

