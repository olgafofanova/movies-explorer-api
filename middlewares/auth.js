const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const { JWT_SECRET = 'dev-some-secret-key' } = process.env;

module.exports = (req, res, next) => {

  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');

 //const token = req.cookies.jwt;
  // if (!token) {
  //   throw new UnauthorizedError('Необходима авторизация');
  // }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new UnauthorizedError('Необходима авторизация');
    next(error);
  }

  req.user = payload;
  next();
};
