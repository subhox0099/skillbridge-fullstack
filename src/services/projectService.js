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

async function createProject({ businessUserId, title, description, location, stipend, skillIds = [] }) {
  const project = await Project.create({
    business_user_id: businessUserId,
    title,
    description,
    location,
    stipend,
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

module.exports = {
  getAllProjects,
  createProject,
};

