const {Schema,model} = require('mongoose');
const Messages = require('../models/message').schema;

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

ChatSchema.statics.getHistory = function (id){
  return this.findOne({_id:id}).select('messages');
}

ChatSchema.statics.subscribe = function (callback){
  callback(this._id,this.messages);
}

module.exports = model('Chat', ChatSchema);