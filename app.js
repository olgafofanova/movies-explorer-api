const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');
const cors = require('cors');
// const path= require('path');
const routesUsers = require('./routes/users');
const routesMovies = require('./routes/movies');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const err = require('./middlewares/err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000 } = process.env;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger); // подключаем логгер запросов

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost',
    'http://fofanaya.nomoredomains.club',
    'http://api.fofanaya.nomoredomains.club',
    'https://localhost:3000',
    'https://localhost:5000',
    'https://localhost',
    'https://fofanaya.nomoredomains.club',
    'https://api.fofanaya.nomoredomains.club',

  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
    // about: Joi.string().min(2).max(30),
    // avatar: Joi.string().pattern(/^https?:\/\/[\d\w.-]+\.[/\d\w.-]+/),
  }),
}), createUser);

app.use(auth);

app.use('/users', auth, routesUsers);
app.use('/movies', auth, routesMovies);

app.all('/*', (req, res, next) => {
  const error = new NotFoundError('Запрашиваемый ресурс не найден2.');
  next(error);
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

app.use(err);

app.listen(PORT, () => {
});
