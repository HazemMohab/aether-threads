import * as authService from './service.js';

export const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const data = await authService.refresh(refreshToken);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
