const { Application, Project } = require('../models');

async function applyToProject({ projectId, studentUserId, coverLetter }) {
  const project = await Project.findByPk(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const existing = await Application.findOne({
    where: {
      project_id: projectId,
      student_user_id: studentUserId,
    },
  });

  if (existing) {
    const error = new Error('You have already applied to this project');
    error.status = 400;
    throw error;
  }

  const application = await Application.create({
    project_id: projectId,
    student_user_id: studentUserId,
    cover_letter: coverLetter,
  });

  return application;
}

module.exports = {
  applyToProject,
};

