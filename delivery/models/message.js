const {Schema,model} = require('mongoose');

const messageSchema = new Schema({
  author: {
    type:Schema.Types.ObjectId,
    required:true,
    trim:true,
  },
  sentAt: {
    type:Date,
    default: Date.now(),
    required:true
  },
  text: {
    type:String,
    trim:true,
    minLength: [2, 'Текст не может быть слишком коротким']
  },
  readAt: {
    type:Date,
    default: Date.now(),
    required:true
  },
});

module.exports = model('Message', messageSchema);