const mongoose = require('mongoose');

mongoose.connect('mongodb://mongodb:27017/Cookmaster');
mongoose.Promise = global.Promise;

module.exports = mongoose;