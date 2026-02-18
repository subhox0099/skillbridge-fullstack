const { Role } = require('../models');

async function seedDefaultRoles() {
  const defaultRoles = ['Student', 'Business', 'Admin'];

  // Fetch existing roles
  const existing = await Role.findAll({
    where: {
      name: defaultRoles,
    },
  });

  const existingNames = new Set(existing.map((r) => r.name));

  const toCreate = defaultRoles
    .filter((name) => !existingNames.has(name))
    .map((name) => ({ name }));

  if (toCreate.length) {
    await Role.bulkCreate(toCreate);
  }
}

module.exports = {
  seedDefaultRoles,
};

