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

