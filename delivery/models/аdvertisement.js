const {Schema,model} = require('mongoose');

const advertisementSchema = new Schema({
  shortTitle: {
    type:String,
    required:true,
    trim:true
  },
  description: {
    type:String,
    trim:true
  },
  images:  {
    type:[{type:String}],
  },
  userId: {
    type:Schema.Types.ObjectId,
    required:true
  },
  createdAt: {
    type:Date,
    default: Date.now(),
    required:true
  },
  updatedAt: {
    type:Date,
    default: Date.now(),
    required:true
  },
  tags: {
    type:[{type:String}],
  },
  isDeleted: {
    type:Boolean,
    default: false,
    required:true
  },
});

module.exports = model('Advertisement', advertisementSchema);