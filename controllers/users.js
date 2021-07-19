const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const { NODE_ENV, JWT_SECRET, SLT_ROUNDS } = process.env;
const SALT_ROUNDS = parseInt(SLT_ROUNDS, 10);

// # возвращает информацию о пользователе (email и имя)
// GET /users/me

// # обновляет информацию о пользователе (email и имя)
// PATCH /users/me

// module.exports.getUsers = (req, res, next) => {
//   User.find({})
//     .then((users) => { res.send(users); })
//     .catch((err) => { next(err); });
// };

// module.exports.getUser = (req, res, next) => {
//   const { userId } = req.params;

//   return User.findById(userId)
//     .then((user) => {
//       if (user) {
//         return res.status(200).send(user);
//       }
//       throw new NotFoundError('Пользователь по указанному _id не найден.');
//     })
//     .catch((err) => {
//       if (err.kind === 'ObjectId') {
//         const error = new ValidationError('Переданы некорректные данные.');
//         next(error);
//       }
//       next(err);
//     });
// };

module.exports.getUserMe = (req, res, next) => {
  const userId = req.user._id;

  return User.findById(userId)
    .orFail(new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        const error = new ValidationError('Переданы некорректные данные.');
        next(error);
      }
      next(err);
    });
};

module.exports.updUser = (req, res, next) => {
  const userId = req.user._id;

  return User.findByIdAndUpdate(
    userId,
    { name: req.body.name, about: req.body.about },
    {
      new: true,
      runValidatirs: true,
    },
  )
    .orFail(new NotFoundError('Пользователь по указанному _id не найден.'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные при обновлении профиля.');
        next(error);
      }
      next(err);
    });
};

// module.exports.updAvatar = (req, res, next) => {
//   const userId = req.user._id;
//   return User.findByIdAndUpdate(
//     userId,
//     { avatar: req.body.avatar },
//     {
//       new: true,
//       runValidatirs: true,
//     },
//   )
//     .orFail(new NotFoundError('Пользователь по указанному _id не найден.'))
//     .then((user) => res.status(200).send(user))
//     .catch((err) => {
//       if (err.name === 'ValidationError') {
//         const error = new ValidationError('Переданы некорректные данные при обновлении аватара.');
//         next(error);
//       }
//       next(err);
//     });
// };

module.exports.createUser = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    throw new ValidationError('Почта или пароль не должны быть пустые.');
  }

  bcrypt.hash(req.body.password, SALT_ROUNDS)
    .then((hash) => User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          throw new ConflictError('Пользователь с такой почтой уже зарегистрирован.');
        }

        User.create({ ...req.body, password: hash })
          .then((usr) => {
            res.status(201).send({
              name: usr.name,
              _id: usr._id,
              email: usr.email,
            });
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              const error = new ValidationError('Переданы некорректные данные при создании пользователя.');
              next(error);
            }
            next(err);
          });
      }))
    .catch((err) => { next(err); });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ValidationError('Почта или пароль не должны быть пустые.');
  }

  return User.findOne({ email }).select('+password')
    .orFail(new UnauthorizedError('Неправильные почта или пароль.'))
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильные почта или пароль.'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильные почта или пароль.'));
          }

          // const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-some-secret-key',
            { expiresIn: '7d' },
          );

          return res
            .cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
            .status(200)
            .send({ message: 'Авторизация прошла успешно.' }).end();
        });
    })
    .catch((err) => {
      next(err);
    });
};
