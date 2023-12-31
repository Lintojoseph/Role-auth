const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        trim:true,
      },
      role: {
        type: Number,
        default: 0,
      },
      status: {
        type: Boolean,
        default: true,
    },
    
    },
    { timestamps: true }
  );
  

  module.exports = mongoose.model('user', userSchema);