const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User, Role } = require('../models');

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

async function register({ name, email, password, roleName }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    const error = new Error('Invalid role');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password_hash: passwordHash,
    role_id: role.id,
  });

  const token = jwt.sign(
    {
      id: user.id,
      role: role.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN || '7d' },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role.name,
    },
  };
}

async function login({ email, password }) {
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role }],
  });

  if (!user) {
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authService.js:login', message: 'login result', data: { outcome: 'noUser' }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {});
    // #endregion
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authService.js:login', message: 'login result', data: { outcome: 'badPassword' }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {});
    // #endregion
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  // #region agent log
  const roleName = user.Role?.name;
  fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'authService.js:login', message: 'login result', data: { outcome: 'success', userId: user.id, role: roleName }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {});
  // #endregion

  const token = jwt.sign(
    {
      id: user.id,
      role: user.Role.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN || '7d' },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
    },
  };
}

module.exports = {
  register,
  login,
};

