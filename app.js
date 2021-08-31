const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const routes = require('./routes');
const err = require('./middlewares/err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { NODE_ENV, BASE, PORT = 3000 } = process.env;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(NODE_ENV === 'production' ? BASE : 'mongodb://localhost:27017/bitfilmsdb', {
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
    'http://diplom.fofanaya.nomoredomains.club',
    'http://api.diplom.fofanaya.nomoredomains.club',
    'https://localhost:3000',
    'https://localhost:5000',
    'https://localhost',
    'https://diplom.fofanaya.nomoredomains.club',
    'https://api.diplom.fofanaya.nomoredomains.club',
    'https://*',
    'http://*',
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

app.use('/', routes);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

app.use(err);

app.listen(PORT, () => {
});
