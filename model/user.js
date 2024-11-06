const { timeStamp } = require('console');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username not found"]
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },

    isAdmin: {
        type: Boolean,
        default: false
    }

}, {timeStamps: true});

module.exports = mongoose.model('User', UserSchema);