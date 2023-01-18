const experess = require("express");
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const userRoute = require('./routes/user');

const app = experess();

app.use('/', indexRouter);
app.use('/user', userRoute);



app.get('/',(req,res)=>{
  res.send('<h1>Hello World</h1>');      //просто строки без res.end(), contentType
});

async function start(PORT, UrlDB) {
  try {
    await mongoose.connect(UrlDB, {
      user: process.env.DB_USERNAME || 'root',
      pass: process.env.DB_USERNAME || 'example',
      dbName: process.env.DB_NAME || 'book_database',
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