/**
 * Geographical utilities for SkillBridge.
 * Uses Haversine formula for real-earth distance between coordinates.
 */

// Earth's mean radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 * @param {number} deg - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Computes the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Converts a distance-based proximity to a 0–1 score.
 * Uses configurable max distance: within maxDistKm => score 1, beyond => decays to 0.
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} maxDistKm - Max distance for full score (default 50 km)
 * @returns {number} Proximity score between 0 and 1
 */
function distanceToProximityScore(distanceKm, maxDistKm = 50) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return 0;
  if (distanceKm <= 0) return 1;
  if (distanceKm >= maxDistKm) return 0;
  // Linear decay within max distance
  return 1 - (distanceKm / maxDistKm);
}

/**
 * Computes location proximity score between project and user.
 * Uses coordinates when available (Haversine), falls back to exact string match.
 * @param {Object} project - { location?, latitude?, longitude? }
 * @param {Object} user - { location?, latitude?, longitude? }
 * @param {number} maxDistKm - Max distance (km) for full proximity score
 * @returns {number} Proximity score between 0 and 1
 */
function calculateLocationProximity(project, user, maxDistKm = 50) {
  const pLat = project?.latitude;
  const pLon = project?.longitude;
  const uLat = user?.latitude;
  const uLon = user?.longitude;

  if (
    Number.isFinite(pLat) && Number.isFinite(pLon) &&
    Number.isFinite(uLat) && Number.isFinite(uLon)
  ) {
    const distanceKm = haversineDistanceKm(pLat, pLon, uLat, uLon);
    return distanceToProximityScore(distanceKm, maxDistKm);
  }

  // Fallback: exact string match
  const pLoc = (project?.location || '').toString().trim().toLowerCase();
  const uLoc = (user?.location || '').toString().trim().toLowerCase();
  if (!pLoc || !uLoc) return 0;
  return pLoc === uLoc ? 1 : 0;
}

module.exports = {
  haversineDistanceKm,
  distanceToProximityScore,
  calculateLocationProximity,
  EARTH_RADIUS_KM,
};
