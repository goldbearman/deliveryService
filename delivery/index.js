const express = require("express");
const mongoose = require('mongoose');

const Chat = require('./models/chat');
// const Message = require('./models/message');

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

    socket.on('sendMessage', async ({receiver, text}) => {
        try {
            const {author} = socket.handshake.query;
            await Chat.sendMessage({author, receiver, text});
            const chat = await Chat.subscribe(author, chatId, message);
            socket.join(chat._id.toString());
            socket.to(chat._id.toString()).emit('newMessage', chat.messages.pop());
        } catch (e) {
            console.log(e);
        }
    });

    socket.on('getHistory', async (id) => {
        try {
            const messages = await Chat.getHistory(id);
            socket.emit('chatHistory', messages);
        } catch (e) {
            console.log(e);
        }
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