import jwt from 'jsonwebtoken';


export const generateTokens = (
  id: number,
  role: string,
  email?: string,
  name?: string,
  branchId?: number | null
) => {
  const jwtSecret = process.env.JWT_SECRET || 'smartpay_sme_secret_jwt_key_2026';
  const refreshSecret = process.env.REFRESH_SECRET || 'refreshsupersecretfallback';

  const accessToken = jwt.sign(
    { id, role, email, name, branchId },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id, role, email, name, branchId },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh
    ? (process.env.REFRESH_SECRET || 'refreshsupersecretfallback')
    : (process.env.JWT_SECRET || 'smartpay_sme_secret_jwt_key_2026');
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
