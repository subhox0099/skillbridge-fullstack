const { validationResult } = require('express-validator');
const profileService = require('../services/profileService');

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, latitude, longitude } = req.body;
    const user = await profileService.updateProfile(req.user.id, {
      location,
      latitude,
      longitude,
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      average_rating: user.average_rating,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  updateProfile,
};
