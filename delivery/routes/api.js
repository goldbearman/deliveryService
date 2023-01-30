const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const fileMulter = require('../middleware/advertisementfile')

const UserModule = require('../models/user');
const Advertisement = require('../models/аdvertisement');

//auth
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

verifyPassword = (user, password) => {
  console.log('verifyPassword ');
  return bcrypt.compareSync(password, user.password);
};

const verify = (email, password, done) => {
  console.log('verify');
  UserModule.findOne({ email }, (err, user) => {
    console.log(user);
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
  console.log('serializeUser');
  cb(null, user.id)
});

passport.deserializeUser((id, cb) => {
  console.log('deserializeUser');
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
      console.log('req.login');
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
    console.log(err);
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

        if (req.user) {
          const user = req.user;
          console.log('req.login');

          const newAdvertisement = await JSON.parse(req.body.advertisementFile);
          await console.log(newAdvertisement);
          await console.log('22   ' + newAdvertisement.shortTitle);
          const advertisement = await Advertisement.create({ ...newAdvertisement, userId: user.id });
          await console.log('3   ' + advertisement);

          res.status(200).json({
            data: [{ ...advertisement, user: { id: user._id, name: user.name } }],
            status: 'ok'
          });
        } else {
          return res.status(401).json({ error: "you need signin", status: 'error' });
        }

      } catch (e) {
        console.log(e);
        res.json('1 Неверная структура данных!');
      }
    } else res.json('2 Неверная структура данных!');

    res.json()
  });

router.post('/advertisements/:id', async (req, res) => {
  const { id } = req.params;
  if (req.user) {
    try {
      await Advertisement.deleteOne({ _id: id })
      res.status(200).json({
        data: { id: user._id, email: user.email, name: user.name, contactPhone: user.contactPhone },
        status: 'ok'
      });
    } catch (e) {
      res.status(403).json({ error: "you are not an author", status: 'error' });
    }
  } else {
    return res.status(401).json({ error: "you need signin", status: 'error' });
  }
});


module.exports = router;