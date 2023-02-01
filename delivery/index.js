const express = require("express");
const mongoose = require('mongoose');

//pasport.js
const session = require('express-session')
const passport = require('passport')

const indexRouter = require('./routes/index');
const apiRoute = require('./routes/api');
const errorMiddleware = require('./middleware/error');

const bodyParser = require('body-parser')

//Chart
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

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
app.use(errorMiddleware);

io.on('connection', (socket) => {
  const {id} = socket;
  console.log(`Socket connected: ${id}`);

  // работа с комнатами
  const {roomName} = socket.handshake.query;
  console.log(`Socket roomName: ${roomName}`);
  //подписываемся на событие комнаты
  socket.join(roomName);
  socket.on('message-to-room', (msg) => {
    console.log('on '+msg)
    msg.type = `room: ${roomName}`;
    socket.to(roomName).emit('message-to-room', msg);
    socket.emit('message-to-room', msg);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${id}`);
  });
});

async function start(PORT, UrlDB) {
  try {
    await mongoose.connect(UrlDB, {
      user: process.env.DB_USERNAME || 'root',
      pass: process.env.DB_USERNAME || 'example',
      dbName: process.env.DB_NAME || 'delivery_database',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    server.listen(PORT);
  } catch (e) {
    console.log(e);
  }
}

const UrlDB = process.env.UrlDB || 'mongodb://root:example@mongo:27017/';
const PORT = process.env.PORT || 3002;
start(PORT, UrlDB);