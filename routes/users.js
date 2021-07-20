const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUserMe,
  updUser,
} = require('../controllers/users');

// # возвращает информацию о пользователе (email и имя)
// GET /users/me

// # обновляет информацию о пользователе (email и имя)
// PATCH /users/me

router.get('/me', getUserMe);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required(),
  }),
}), updUser);

module.exports = router;
