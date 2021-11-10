const mongoose = require('../database');
//const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true,
    },
    password: {
        type: String,
        require: true,
        select: false,
    },
    role: {
        type: String,
        require: false,
        default: 'user'
    },
    
}, { versionKey: false } );


const User = mongoose.model('User', UserSchema);

module.exports = User;