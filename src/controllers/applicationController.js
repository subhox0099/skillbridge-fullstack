const { validationResult } = require('express-validator');
const applicationService = require('../services/applicationService');

async function apply(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, coverLetter } = req.body;

    const application = await applicationService.applyToProject({
      projectId,
      studentUserId: req.user.id,
      coverLetter,
    });

    return res.status(201).json(application);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  apply,
};

