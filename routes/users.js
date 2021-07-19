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

// router.get('/:userId', celebrate({
//   params: Joi.object().keys({
//     userId: Joi.string().length(24).hex(),
//   }),
// }), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required(),
  }),
}), updUser);

// router.patch('/me/avatar', celebrate({
//   body: Joi.object().keys({
//     avatar: Joi.string().required().pattern(/^https?:\/\/[\d\w.-]+\.[/\d\w.-]+/),
//   }),
// }), updAvatar);

module.exports = router;
