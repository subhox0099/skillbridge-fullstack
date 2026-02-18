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
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

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

