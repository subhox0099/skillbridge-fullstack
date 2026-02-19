const { User, Role, Skill, Project } = require('../models');
const { calculateMatchScore } = require('../utils/matchUtil');

async function getRecommendedCandidates(projectId) {
  let project;
  try {
    project = await Project.findByPk(projectId, {
      include: [
        {
          model: Skill,
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!project) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }

    const projectSkillIds = (project.Skills || []).map((s) => s.id);

    // Find Student role first
    const studentRole = await Role.findOne({ where: { name: 'Student' } });
    
    if (!studentRole) {
      return {
        project: {
          id: project.id,
          title: project.title,
          location: project.location,
        },
        candidates: [],
      };
    }

    const students = await User.findAll({
      where: {
        role_id: studentRole.id,
        is_active: true,
      },
      include: [
        {
          model: Skill,
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    const scored = students.map((student) => {
    const userSkillIds = (student.Skills || []).map((s) => s.id);

    const score = calculateMatchScore({
      projectSkillIds,
      userSkillIds,
      averageRating: student.average_rating || 0,
      project: {
        location: project.location,
        latitude: project.latitude,
        longitude: project.longitude,
      },
      user: {
        location: student.location,
        latitude: student.latitude,
        longitude: student.longitude,
      },
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
  } catch (error) {
    console.error('Error in getRecommendedCandidates:', error);
    // Return empty result instead of throwing to prevent frontend crashes
    return {
      project: {
        id: projectId || null,
        title: project?.title || 'Unknown',
        location: project?.location || null,
      },
      candidates: [],
    };
  }
}

module.exports = {
  getRecommendedCandidates,
};

