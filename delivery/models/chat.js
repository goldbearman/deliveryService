const {Schema,model} = require('mongoose');
const Messages = require('../models/message');

const ChatSchema = new Schema({
  users: {
    type:[Schema.Types.ObjectId],
    required:true,
  },
  createdAt: {
    type:Date,
    default: Date.now(),
    required:true,
  },
  messages:  {
    type:[Messages],
    required:true,
  },
});

module.exports = model('Chat', ChatSchema);