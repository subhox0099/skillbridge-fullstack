const { User } = require('../models');

async function updateProfile(userId, { location, latitude, longitude }) {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const updates = {};
  if (location !== undefined) updates.location = location;
  if (latitude !== undefined) updates.latitude = latitude;
  if (longitude !== undefined) updates.longitude = longitude;

  await user.update(updates);
  return user;
}

module.exports = {
  updateProfile,
};
