/**
 * Haversine Distance Utility
 * Computes great-circle distance between two GPS coordinates.
 * Used for resolution geo-validation in the TRS pipeline.
 */

/**
 * @param {number} lat1 - Complaint origin latitude
 * @param {number} lng1 - Complaint origin longitude
 * @param {number} lat2 - Resolution capture latitude
 * @param {number} lng2 - Resolution capture longitude
 * @returns {number} Distance in meters (rounded to nearest integer)
 */
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth mean radius in metres

  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lng2 - lng1);

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * India bounding box guard — rough sanity check on incoming coordinates.
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
function isWithinIndia(lat, lng) {
  return lat >= 6.5 && lat <= 35.7 && lng >= 68.0 && lng <= 97.4;
}

module.exports = { haversineDistanceMeters, isWithinIndia };
