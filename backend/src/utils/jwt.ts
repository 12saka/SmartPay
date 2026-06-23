import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfallback';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refreshsupersecretfallback';

export const generateTokens = (userId: number, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh ? REFRESH_SECRET : JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
