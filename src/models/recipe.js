const mongoose = require('../database');
const bcrypt = require('bcryptjs');

const RecipeSchema = new mongoose.Schema({
    name : {
        type: String,
        require: true,
    },
    ingredients : {
        type: String,
        require: true,
    },
    preparation: {
        type: String,
        require: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    imgURL:{
        type: String,
    }
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;