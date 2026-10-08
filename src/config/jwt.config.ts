import { registerAs } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'super-secret-jwt-key-change-in-production';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }

  return {
    secret: secret || DEV_FALLBACK_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  };
});
