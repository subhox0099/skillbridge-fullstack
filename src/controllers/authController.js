const { validationResult } = require('express-validator');
const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, password, role,
    } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
      roleName: role,
    });

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  // #region agent log
  fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authController.js:login', message: 'login entry', data: { hasEmail: !!req.body?.email, hasPassword: !!req.body?.password }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {});
  // #endregion
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
};

