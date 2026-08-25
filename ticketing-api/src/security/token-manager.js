import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/invariant-error.js';

const TokenManager = {
  generateAccessToken: (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '30m'}),
  generateRefreshToken: (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d'}),
  verifyRefreshToken: (refreshToken) => {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return payload;
    } catch (error) {
      console.log(error);
      throw new InvariantError('Refresh token tidak valid');
    }
  },
  verify: (accesToken, secret) => {
    try {
      const payload = jwt.verify(accesToken, secret);
      return payload;
    } catch (error) {
      console.log(error);
      throw new InvariantError('Access token tidak valid');
    }
  }
};

export default TokenManager;