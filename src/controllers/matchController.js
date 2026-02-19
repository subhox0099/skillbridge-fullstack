const matchService = require('../services/matchService');

async function getMatches(req, res, next) {
  const { projectId } = req.params;
  // #region agent log
  fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'matchController.js:getMatches', message: 'match entry', data: { projectId }, timestamp: Date.now(), hypothesisId: 'HM' }) }).catch(() => {});
  // #endregion
  try {
    const result = await matchService.getRecommendedCandidates(projectId);
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'matchController.js:getMatches', message: 'match success', data: { projectId, candidatesCount: (result.candidates || []).length }, timestamp: Date.now(), hypothesisId: 'HM' }) }).catch(() => {});
    // #endregion
    return res.json(result);
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'matchController.js:getMatches', message: 'match error', data: { projectId, errMessage: err.message }, timestamp: Date.now(), hypothesisId: 'HM' }) }).catch(() => {});
    // #endregion
    return next(err);
  }
}

module.exports = {
  getMatches,
};

