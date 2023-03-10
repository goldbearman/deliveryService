const express = require('express');
const router = express.Router();

const fileMulter = require('../middleware/advertisementfile')

const UserModule = require('../models/user');
const Advertisement = require('../models/аdvertisement');

router.post('/signup', async (req, res) => {
  try {
    console.log('try')
    const { email, name, password, contactPhone } = req.body;
    const user = await UserModule.create({ email, name, passwordHash: password, contactPhone });
    res.status(200).json({
      data: { id: user._id, email: user.email, name: user.name, contactPhone: user.contactPhone },
      status: 'ok'
    });
  } catch (e) {
    res.status(500).json({ error: "email занят", status: 'error' });
  }
})


router.get('/advertisements', async (req, res) => {
  try {
    console.log('/advertisements')
    const advertisements = await Advertisement.find().select('-__v');
    res.json(advertisements);
  } catch (e) {
    res.status(500).json({ error: "db error", status: 'error' });
  }
})

router.get('/advertisements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log('/advertisements/:id')
    const advertisement = await Advertisement.findById(id).select('-__v');
    res.json(advertisement);
  } catch (e) {
    res.status(500).json({ error: "there is no such ad", status: 'error' });
  }
})

router.post('/advertisements',
  fileMulter.single('advertisementFile'),    //(ожидаемое имя файла)
  async (req, res) => {
    // console.log(req.file);
    // const { path } = req.file
    console.log(req.body);
    if (req.body.advertisementFile) {
      try {
        // const el = {
        //   shortTitle: "Темные алеи",
        //   description: "alei",
        //   images: ["/uploads/507f1f77bcf86cd799439011/slon_v_profil.jpg", "/uploads/507f1f77bcf86cd799439011/slon_v_fas.jpg", "/uploads/507f1f77bcf86cd799439011/slon_hobot.jpg"]
        // }
        // const newEl = JSON.stringify(el);
        // console.log(newEl);


        const newAdvertisement = await JSON.parse(req.body.advertisementFile);
        await console.log( newAdvertisement);
        await console.log('22   '+ newAdvertisement.shortTitle);
        const advertisement = await Advertisement.create({ ...newAdvertisement });
        await console.log('3   '+advertisement);


        // newBook.fileBook = path;
        // newBook.id = uuid();
        // if (!keyComparison(new Book(), newBook)) {         //Проверка наличия всех полей
        //   res.json('Не хватает данных в книге!');
        // } else {
        //   const isNewBook = stor.books.every(el => el.title !== newBook.title && el.authors !== newBook.authors);
        //   if (isNewBook) {                                  //Проверка дублирующей книги
        //     stor.books.push(newBook);
        //     res.json({ path })
        //   } else res.json('Данная книга уже есть!');
        // }
      } catch (e) {
        console.log(e);
        res.json('1 Неверная структура данных!');
      }
    } else res.json('2 Неверная структура данных!');

    res.json()
  });


module.exports = router;