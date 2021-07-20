const Movies = require('../models/movies');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-err');

// GET /getMovies — возвращает все сохранённые пользователем фильмы

// создаёт фильм с переданными в теле
// country, director, duration, year, description,
// image, trailer, nameRU, nameEN и thumbnail, movieId
// POST /movies

// # удаляет сохранённый фильм по id
// DELETE /movies/movieId

module.exports.getMovies = (req, res, next) => {
  Movies.find({})
    .then((movies) => { res.send(movies); })
    .catch((err) => { next(err); });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  return Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => { res.status(201).send(movie); })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные.');
        next(error);
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const owner = req.user._id;

  Movies.findById(movieId)
    .orFail(new NotFoundError('Фильм с указанным _id не найден.'))
    .then((movie) => {
      if (!(movie.owner._id.toString() === owner)) { throw new ForbiddenError('Нет прав на удаление фильма'); }

      Movies.findByIdAndRemove(movieId)
        .then((movieToDelete) => {
          if (movieToDelete) {
            return res.status(200).send(movieToDelete);
          }
          throw new NotFoundError('Фильм с указанным _id не найден.');
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
