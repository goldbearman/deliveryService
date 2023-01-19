const {Schema,model} = require('mongoose');

const userSchema = new Schema({
  email: {
    type:String,
    required:true,
    unique:true,
  },
  name: {
    type:String,
    required:true
  },
  passwordHash:  {
    type:String,
    required:true
  },
  contactPhone: {
    type:String,
    required:true
  },
});

module.exports = model('UserModule', userSchema);