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

async function getApplications(req, res, next) {
  try {
    const { projectId } = req.query;
    const applications = await applicationService.getApplications({
      projectId: projectId ? parseInt(projectId) : null,
      studentUserId: req.user.role === 'Student' ? req.user.id : null,
      businessUserId: req.user.role === 'Business' || req.user.role === 'Admin' ? req.user.id : null,
    });

    return res.json(applications);
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const application = await applicationService.updateApplicationStatus({
      applicationId: parseInt(id),
      status,
      businessUserId: req.user.id,
    });

    return res.json(application);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  apply,
  getApplications,
  updateStatus,
};
