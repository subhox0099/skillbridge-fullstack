const { Project, Skill, ProjectSkill, User } = require('../models');

async function getAllProjects() {
  const projects = await Project.findAll({
    include: [
      {
        model: Skill,
        through: { attributes: [] },
      },
      {
        model: User,
        as: 'business',
        attributes: ['id', 'name', 'email', 'location'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return projects;
}

async function createProject({
  businessUserId, title, description, location, stipend, skillIds = [], latitude, longitude,
}) {
  const project = await Project.create({
    business_user_id: businessUserId,
    title,
    description,
    location,
    stipend,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });

  if (skillIds.length) {
    const bulk = skillIds.map((skillId) => ({
      project_id: project.id,
      skill_id: skillId,
    }));
    await ProjectSkill.bulkCreate(bulk);
  }

  const fullProject = await Project.findByPk(project.id, {
    include: [
      {
        model: Skill,
        through: { attributes: [] },
      },
    ],
  });

  return fullProject;
}

async function updateProjectStatus({ projectId, status, businessUserId }) {
  const project = await Project.findByPk(projectId);
  
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  if (project.business_user_id !== businessUserId) {
    const error = new Error('Unauthorized');
    error.status = 403;
    throw error;
  }

  project.status = status;
  await project.save();

  return project;
}

async function getProjectStats(businessUserId) {
  const { Application } = require('../models');
  
  const projects = await Project.findAll({
    where: { business_user_id: businessUserId },
    include: [
      {
        model: Application,
        attributes: ['id', 'status'],
      },
    ],
  });

  const stats = {
    total: projects.length,
    open: 0,
    inProgress: 0,
    completed: 0,
    closed: 0,
    totalApplications: 0,
    selectedApplications: 0,
  };

  projects.forEach(project => {
    if (project.status === 'OPEN') stats.open++;
    else if (project.status === 'IN_PROGRESS') stats.inProgress++;
    else if (project.status === 'COMPLETED') stats.completed++;
    else if (project.status === 'CLOSED') stats.closed++;

    stats.totalApplications += project.Applications?.length || 0;
    stats.selectedApplications += project.Applications?.filter(app => app.status === 'SELECTED').length || 0;
  });

  return stats;
}

module.exports = {
  getAllProjects,
  createProject,
  updateProjectStatus,
  getProjectStats,
};
