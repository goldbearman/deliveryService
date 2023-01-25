const express = require("express");
const mongoose = require('mongoose');

//pasport.js
const session = require('express-session')
const passport = require('passport')

const indexRouter = require('./routes/index');
const apiRoute = require('./routes/api');

const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json())
//pasport.js
app.use(session({
  secret: 'SECRET',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter);
app.use('/api', apiRoute);

async function start(PORT, UrlDB) {
  try {
    await mongoose.connect(UrlDB, {
      user: process.env.DB_USERNAME || 'root',
      pass: process.env.DB_USERNAME || 'example',
      dbName: process.env.DB_NAME || 'delivery_database',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT);
  } catch (e) {
    console.log(e);
  }
}

const UrlDB = process.env.UrlDB || 'mongodb://root:example@mongo:27017/';
const PORT = process.env.PORT || 3002;
start(PORT, UrlDB);