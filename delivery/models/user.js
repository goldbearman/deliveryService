const {Schema,model} = require('mongoose');

const userSchema = new Schema({
  email: {
    type:String,
    required:true,
    unique:true,
    trim:true,
  },
  name: {
    type:String,
    required:true,
    trim:true,
  },
  password:  {
    type:String,
    required:true,
    trim:true,
  },
  contactPhone: {
    type:String,
    required:true,
    trim:true,
  },
});

module.exports = model('UserModule', userSchema);