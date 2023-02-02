const {Schema,model} = require('mongoose');
const Messages = require('../models/message').schema;
const Message = require('../models/message');

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

ChatSchema.statics.sendMessage = async function ({author,receiver, text}){
  return await this.find({ users: [author, receiver] }, async (err, chat) => {
    if (err) console.log(err)
    if (chat) {
      const newMessage = await Message.create({ author, text });
      const messages = await chat.messages.push(newMessage);
      await this.findOneAndUpdate({ _id: chat._id }, { $set: messages });
      return newMessage;
    } else {
      const newMessage = await Message.create({ author, text });
      await this.create({ users: [author, receiver], massages: [newMessage] });
      return newMessage;
    }
  });
}

ChatSchema.statics.subscribe = function (callback){
  callback(this._id,this.messages);
}

module.exports = model('Chat', ChatSchema);