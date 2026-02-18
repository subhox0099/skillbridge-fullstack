const matchService = require('../services/matchService');

async function getMatches(req, res, next) {
  try {
    const { projectId } = req.params;
    const result = await matchService.getRecommendedCandidates(projectId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMatches,
};

