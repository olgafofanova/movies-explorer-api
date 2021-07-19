const Movies = require('../models/movies');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-err');

// GET /getMovies — возвращает все сохранённые пользователем фильмы

// # создаёт фильм с переданными в теле
// # country, director, duration, year, description, image, trailer, nameRU, nameEN и thumbnail, movieId
// POST /movies

// # удаляет сохранённый фильм по id
// DELETE /movies/movieId

module.exports.getMovies = (req, res, next) => {
  Movies.find({})
    .then((movies) => { res.send(movies); })
    .catch((err) => { next(err); });
};

module.exports.createMovies = (req, res, next) => {
  const { name, link } = req.body;
  return Movies.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((movies) => { res.status(201).send(movies); })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные.');
        next(error);
      }
      next(err);
    });
};

module.exports.deleteMovies = (req, res, next) => {
  const { movieId } = req.params;
  const owner = req.user._id;

  Movies.findById(movieId)
    .orFail(new NotFoundError('Карточка с указанным _id не найдена.'))
    .then((movie) => {
      if (!(movie.owner._id.toString() === owner)) { throw new ForbiddenError('Нет прав на удаление карточки'); }

      Movies.findByIdAndRemove(movieId)
        .then((movieToDelete) => {
          if (movieToDelete) {
            return res.status(200).send(movieToDelete);
          }
          throw new NotFoundError('Карточка с указанным _id не найдена.');
        });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        const error = new ValidationError('Переданы некорректные данные.');
        next(error);
      }
      next(err);
    });
};

// module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
//   req.params.cardId,
//   { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
//   { new: true },
// ).then((card) => {
//   if (card) {
//     return res.status(200).send(card);
//   }
//   throw new NotFoundError('Карточка с указанным _id не найдена.');
// })
//   .catch((err) => {
//     if (err.kind === 'ObjectId') {
//       const error = new ValidationError('Переданы некорректные данные для постановки/снятии лайка.');
//       next(error);
//     }
//     next(err);
//   });

// module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
//   req.params.cardId,
//   { $pull: { likes: req.user._id } }, // убрать _id из массива
//   { new: true },
// )
//   .then((card) => {
//     if (card) {
//       return res.status(200).send(card);
//     }
//     throw new NotFoundError('Карточка с указанным _id не найдена.');
//   })
//   .catch((err) => {
//     if (err.kind === 'ObjectId') {
//       const error = new ValidationError('Переданы некорректные данные для постановки/снятии лайка.');
//       next(error);
//     }
//     next(err);
//   });
