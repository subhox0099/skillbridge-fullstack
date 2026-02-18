// Match Score = (Skill Match Percentage × weightSkill)
//              + (Average Rating × weightRating)
//              + (Location Proximity Score × weightLocation)
// Weights are configurable via MATCH_WEIGHT_SKILL, MATCH_WEIGHT_RATING, MATCH_WEIGHT_LOCATION

const { getMatchingWeights, getMaxDistanceKm } = require('../config/matchingWeights');
const { calculateLocationProximity: geoLocationProximity } = require('./geoUtil');

function calculateSkillMatchPercentage(projectSkillIds, userSkillIds) {
  if (!projectSkillIds.length) return 0;

  const projectSet = new Set(projectSkillIds);
  let matched = 0;

  userSkillIds.forEach((id) => {
    if (projectSet.has(id)) {
      matched += 1;
    }
  });

  const percentage = (matched / projectSet.size) * 100;
  return Number.isNaN(percentage) ? 0 : percentage;
}

/**
 * Location proximity score using Haversine when lat/lng available, else exact string match.
 * @param {Object} project - { location?, latitude?, longitude? }
 * @param {Object} user - { location?, latitude?, longitude? }
 * @returns {number} Proximity score 0–1
 */
function calculateLocationProximity(project, user) {
  const maxDistKm = getMaxDistanceKm();
  return geoLocationProximity(project, user, maxDistKm);
}

/**
 * Calculates match score with configurable weights.
 * @param {Object} params
 * @param {number[]} params.projectSkillIds
 * @param {number[]} params.userSkillIds
 * @param {number} params.averageRating
 * @param {Object} params.project - { location?, latitude?, longitude? }
 * @param {Object} params.user - { location?, latitude?, longitude? }
 * @param {Object} [params.weights] - Optional override: { skillMatch, averageRating, locationProximity }
 */
function calculateMatchScore({
  projectSkillIds,
  userSkillIds,
  averageRating,
  project,
  user,
  weights,
}) {
  const w = weights || getMatchingWeights();
  const skillMatchPercentage = calculateSkillMatchPercentage(projectSkillIds, userSkillIds);
  const locationScore = calculateLocationProximity(project, user);
  const rating = Number.isFinite(averageRating) ? averageRating : 0;

  const score =
    (skillMatchPercentage / 100) * w.skillMatch +
    (rating / 5) * w.averageRating +
    locationScore * w.locationProximity;

  return Number((score * 100).toFixed(2));
}

module.exports = {
  calculateSkillMatchPercentage,
  calculateLocationProximity,
  calculateMatchScore,
};
