const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

// возвращает все сохранённые пользователем фильмы
// GET /movies

// создаёт фильм с переданными в теле
// country, director, duration, year, description,
// image, trailer, nameRU, nameEN и thumbnail, movieId
// POST /movies

// # удаляет сохранённый фильм по id
// DELETE /movies/movieId

router.get('/', getMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(/^https?:\/\/[\d\w.-]+\.[/\d\w.-]+/),
    trailer: Joi.string().required().pattern(/^https?:\/\/[\d\w.-]+\.[/\d\w.-]+/),
    thumbnail: Joi.string().required().pattern(/^https?:\/\/[\d\w.-]+\.[/\d\w.-]+/),
    movieId: Joi.string().length(24).hex(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex(),
  }),
}), deleteMovie);

module.exports = router;
