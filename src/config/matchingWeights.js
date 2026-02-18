/**
 * Dynamic matching weights for the candidate matching algorithm.
 * Weights can be overridden via environment variables.
 * All weights must sum to 1.0 for consistent scoring.
 */

const DEFAULT_WEIGHTS = {
  skillMatch: 0.5,
  averageRating: 0.3,
  locationProximity: 0.2,
};

function parseFloatEnv(key, fallback) {
  const val = process.env[key];
  if (val === undefined || val === '') return fallback;
  const num = parseFloat(val);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Resolves matching weights from env or defaults.
 * Normalizes so they sum to 1.0.
 * @returns {{ skillMatch: number, averageRating: number, locationProximity: number }}
 */
function getMatchingWeights() {
  const skillMatch = parseFloatEnv('MATCH_WEIGHT_SKILL', DEFAULT_WEIGHTS.skillMatch);
  const averageRating = parseFloatEnv('MATCH_WEIGHT_RATING', DEFAULT_WEIGHTS.averageRating);
  const locationProximity = parseFloatEnv('MATCH_WEIGHT_LOCATION', DEFAULT_WEIGHTS.locationProximity);

  const sum = skillMatch + averageRating + locationProximity;
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };

  return {
    skillMatch: skillMatch / sum,
    averageRating: averageRating / sum,
    locationProximity: locationProximity / sum,
  };
}

/**
 * Max distance in km for full proximity score (Haversine).
 * Override via MATCH_MAX_DISTANCE_KM.
 */
function getMaxDistanceKm() {
  return parseFloatEnv('MATCH_MAX_DISTANCE_KM', 50);
}

module.exports = {
  getMatchingWeights,
  getMaxDistanceKm,
  DEFAULT_WEIGHTS,
};
