const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const NotFoundError = require('../errors/not-found-err');
const routesUsers = require('./users');
const routesMovies = require('./movies');
const auth = require('../middlewares/auth');
const { createUser, login, out } = require('../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createUser);

router.post('/signout', out);

router.use(auth);

router.use('/users', auth, routesUsers);
router.use('/movies', auth, routesMovies);

router.all('/*', (req, res, next) => {
  const error = new NotFoundError('Запрашиваемый ресурс не найден.');
  next(error);
});

module.exports = router;
