const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
   commentId: String,
   user: String,
   comment: String
});

const Comment = mongoose.model('Comment', commentSchema)

module.exports = { Comment }