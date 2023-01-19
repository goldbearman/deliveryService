const express = require('express');
const router = express.Router();

const UserModule = require('../models/user');

router.post('/signup', async (req, res) => {
  try{
    console.log('try')
    const {email, name, password, contactPhone} = req.body;
    const user = await UserModule.create({email, name, passwordHash:password, contactPhone});
    // console.log(user)
    res.status(200).json({ data:{id:user._id,email:user.email,name:user.name,contactPhone:user.contactPhone}, status: 'ok' });
  }catch (e){
    res.status(500).json({ error: "email занят", status: 'error' });
  }
})

module.exports = router;