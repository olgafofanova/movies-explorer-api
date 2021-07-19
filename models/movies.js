const mongoose = require('mongoose');
const isURL = require('validator/lib/isURL');
const isAlphanumeric = require('validator/lib/isAlphanumeric');

const moviesSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value, { require_protocol: true }),
      message: 'Неправильная ссылка',
    },
  },
  trailer: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value, { require_protocol: true }),
      message: 'Неправильная ссылка',
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value, { require_protocol: true }),
      message: 'Неправильная ссылка',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
 nameRU: {
      type: String,
      required: true,
      validate: {
        validator: (value) => isAlphanumeric(value,'ru-RU'),
        message: 'Название должно быть на русском языке',
      },
  },
 nameEN: {
      type: String,
      required: true,
      validate: {
        validator: (value) => isAlphanumeric(value,'en-US'),
        message: 'Название должно быть на английском языке',
      },
    },
});

module.exports = mongoose.model('movies', moviesSchema);
