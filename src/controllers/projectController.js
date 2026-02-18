const { validationResult } = require('express-validator');
const projectService = require('../services/projectService');

async function listProjects(req, res, next) {
  try {
    const projects = await projectService.getAllProjects();
    return res.json(projects);
  } catch (err) {
    return next(err);
  }
}

async function createProject(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, location, stipend, skillIds, latitude, longitude,
    } = req.body;

    const project = await projectService.createProject({
      businessUserId: req.user.id,
      title,
      description,
      location,
      stipend,
      skillIds,
      latitude,
      longitude,
    });

    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listProjects,
  createProject,
};

