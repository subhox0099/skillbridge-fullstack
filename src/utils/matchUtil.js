// Match Score = (Skill Match Percentage × 0.5)
//              + (Average Rating × 0.3)
//              + (Location Proximity Score × 0.2)

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

function calculateLocationProximity(projectLocation, userLocation) {
  if (!projectLocation || !userLocation) return 0;
  return projectLocation.toLowerCase().trim() === userLocation.toLowerCase().trim() ? 1 : 0;
}

function calculateMatchScore({
  projectSkillIds,
  userSkillIds,
  averageRating,
  projectLocation,
  userLocation,
}) {
  const skillMatchPercentage = calculateSkillMatchPercentage(projectSkillIds, userSkillIds);
  const locationScore = calculateLocationProximity(projectLocation, userLocation);
  const rating = Number.isFinite(averageRating) ? averageRating : 0;

  const score =
    skillMatchPercentage * 0.5 +
    rating * 0.3 +
    locationScore * 0.2;

  return Number(score.toFixed(2));
}

module.exports = {
  calculateSkillMatchPercentage,
  calculateLocationProximity,
  calculateMatchScore,
};

