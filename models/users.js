const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    email:{
        type:String,
        required:true,
        unique:true
    }

});

module.exports = mongoose.model('users', userSchema);  // exporting our schema