const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const dotenv = require('dotenv');
const app = require('./app');
const { sequelize } = require('./models');
const { seedDefaultRoles } = require('./config/seedRoles');
const { ensureGeoColumns } = require('./config/ensureGeoColumns');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureGeoColumns(sequelize);
    await seedDefaultRoles();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`SkillBridge backend listening on port ${PORT}`);
      // #region agent log
      fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'server.js:listen', message: 'backend started', data: { port: PORT }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(() => {});
      // #endregion
    });
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'server.js:catch', message: 'backend start failed', data: { errorMessage: err.message, name: err.name }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(() => {});
    // #endregion
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

