const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    filename: String,
    fileType: String,
    fileSize: Number,
    
  });
  
  module.exports= mongoose.model('File', fileSchema);