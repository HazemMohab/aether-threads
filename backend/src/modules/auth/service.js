import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

export const register = async ({ email, password, full_name }) => {
  const existing = await db('users').where({ email }).first();
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const password_hash = await bcrypt.hash(password, 10);
  const [user] = await db('users').insert({ email, password_hash, full_name }).returning(['id', 'email', 'full_name', 'role']);

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  return { accessToken, refreshToken, user };
};

export const login = async ({ email, password }) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } };
};

export const refresh = async (token) => {
  const payload = verifyRefreshToken(token);
  const user = await db('users').where({ id: payload.id }).first();
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  return { accessToken };
};

export const getProfile = async (userId) => {
  const user = await db('users').where({ id: userId }).select('id', 'email', 'full_name', 'role', 'created_at').first();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
};
