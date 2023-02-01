const express = require("express");
const mongoose = require('mongoose');

const Chat = require('./models/chat');
const Message = require('./models/message');

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

    socket.on('message-to-chart', async ({author, receiver, message}) => {

        const chart = await Chat.find({users: [author, receiver]}, async (err, chart) => {
            if (err) console.log(err)
            if (chart) {
                const messages = await chart.messages.push(Message.create({author, text: message}));
                return await Chat.findOneAndUpdate({_id: chart._id}, {$set: messages});
            } else {
                const newMessage = await Message.create({author, text: message});
                return await Chat.create({users: [author, receiver], massages: newMessage});
            }
        });

        socket.to(chart._id).emit('message-to-chart', chart.messages.pop());
    });

    socket.on('getHistory', async (id) => {
        try {
            const messages = await Chat.getHistory(id);
            socket.emit('getHistory', messages);
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