const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const fileMulter = require('../middleware/advertisementfile')

const UserModule = require('../models/user');
const Advertisement = require('../models/аdvertisement');

//auth
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

verifyPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

const verify = (email, password, done) => {
  UserModule.findOne({ email }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false)
    }

    if (!verifyPassword(user, password)) {
      return done(null, false)
    }

    return done(null, user)
  })
};

const options = {
  usernameField: "email",
  passwordField: "password",
};

passport.use('local', new LocalStrategy(options, verify))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
});

passport.deserializeUser((id, cb) => {
  UserModule.findById(id, (err, user) => {
    if (err) {
      return cb(err)
    }
    cb(null, user)
  })
});

router.post('/signup', async (req, res, next) => {
  try {
    const { email, name, password, contactPhone } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModule.create({ email, name, password: hash, contactPhone });
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        data: { id: user._id, email: user.email, name: user.name, contactPhone: user.contactPhone },
        status: 'ok'
      });
    });
  } catch (e) {
    res.status(500).json({ error: "email занят", status: 'error' });
  }
})

router.post('/signin', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (!user) {
      return res.send({ error: "Неверный логин или пароль", status: "error" });
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.status(200).json({
        data: { id: user._id, email: user.email, name: user.name, contactPhone: user.contactPhone },
        status: 'ok'
      });
    });
  })(req, res, next);
});


router.get('/advertisements', async (req, res) => {
  try {
    const advertisements = await Advertisement.find().select('-__v');
    res.json(advertisements);
  } catch (e) {
    res.status(500).json({ error: "db error", status: 'error' });
  }
})

router.get('/advertisements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const advertisement = await Advertisement.findById(id).select('-__v');
    res.json(advertisement);
  } catch (e) {
    res.status(500).json({ error: "there is no such ad", status: 'error' });
  }
})

router.post('/advertisements',
  fileMulter.single('advertisementFile'),    //(ожидаемое имя файла)
  async (req, res) => {
    if (req.body.advertisementFile) {
      try {
        if (req.user) {
          const user = req.user;
          const newAdvertisement = await JSON.parse(req.body.advertisementFile);
          const { shortTitle, description, images, createdAt, _id } = await Advertisement.create({
            ...newAdvertisement,
            userId: user.id
          });
          res.status(200).json({
            data: [{ id: _id, shortTitle, description, images, user: { id: user._id, name: user.name }, createdAt }],
            status: 'ok'
          });
        } else {
          return res.status(401).json({ error: "you need signin", status: 'error' });
        }
      } catch (e) {
        res.json('Неверная структура данных!');
      }
    } else res.json('Неверная структура данных!');
    res.json()
  });

router.delete('/advertisements/:id', async (req, res) => {
  const { id } = req.params;
  if (req.user) {
    const advertisement = await Advertisement.findById(id);
    if (req.user.id === advertisement.userId.toString()) {
      try {
        await Advertisement.updateOne({ _id: id }, { isDeleted: true });
        res.status(200).json({
          data: 'advertisement delete',
          status: 'ok'
        });
      } catch (e) {
        res.status(400).json({ error: "invalid id", status: 'error' });
      }
    } else {
      return res.status(403).json({ error: "it is not your advertisement", status: 'error' });
    }
  } else {
    return res.status(401).json({ error: "you need signin", status: 'error' });
  }
});

router.post('/advertisements/search', async (req, res) => {
  const { shortText, description, userId, tags } = req.body;
  console.log(shortText, description, userId, tags)
  console.log(typeof userId);
  const userIdNum = +userId.trim();
  console.log(userIdNum);
  const id = mongoose.Types.ObjectId(userIdNum);
  console.log(id);
  try {
    const advertisements = await Advertisement.find({
      $or: [{ shortText: `/${shortText}/i` },
        { description: `/${description}/i` },
        { userId:id },
        { tags }]
    });
    //todo Дописать правильные выводные данные
    const noDeletedAds = await advertisements.filter(el => !el.isDeleted);
    res.status(200).json({ noDeletedAds });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "invalid data", status: 'error' });
  }
})

module.exports = router;