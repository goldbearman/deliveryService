const {Schema,model} = require('mongoose');

const advertisementSchema = new Schema({
  shortTitle: {
    type:String,
    required:true,
    trim:true,
    minLength: [2, 'Запрос не может быть слишком коротким']
  },
  description: {
    type:String,
    trim:true,
    minLength: [2, 'Запрос не может быть слишком коротким']
  },
  images:  {
    type:[{type:String}],
  },
  userId: {
    type:Schema.Types.ObjectId,
    required:true,
    trim:true,
    minLength:2
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
    minLength:2
  },
  isDeleted: {
    type:Boolean,
    default: false,
    required:true
  },
});

module.exports = model('Advertisement', advertisementSchema);