const { User, Role, Skill, Project } = require('../models');
const { calculateMatchScore } = require('../utils/matchUtil');

async function getRecommendedCandidates(projectId) {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: Skill,
        through: { attributes: [] },
      },
    ],
  });

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const projectSkillIds = project.Skills.map((s) => s.id);

  const students = await User.findAll({
    include: [
      {
        model: Role,
        where: { name: 'Student' },
      },
      {
        model: Skill,
        through: { attributes: [] },
      },
    ],
  });

  const scored = students.map((student) => {
    const userSkillIds = (student.Skills || []).map((s) => s.id);

    const score = calculateMatchScore({
      projectSkillIds,
      userSkillIds,
      averageRating: student.average_rating || 0,
      projectLocation: project.location,
      userLocation: student.location,
    });

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      location: student.location,
      average_rating: student.average_rating,
      skills: student.Skills,
      match_score: score,
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  return {
    project: {
      id: project.id,
      title: project.title,
      location: project.location,
    },
    candidates: scored,
  };
}

module.exports = {
  getRecommendedCandidates,
};

