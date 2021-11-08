const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Recipe = require('../models/Recipe');

const router = express.Router();

router.use(authMiddleware);

//list
router.get('/', async (req, res) => {
    res.send({ ok: true, user: req.userId });
});

//show
router.get('/:recipeId', async (req, res) => {
    res.send({ user: req.userId });
});

//register
router.post('/', async (req, res) => {
    try{

        const recipe = await Recipe.create(req.body);

        return res.send({ recipe });

    }catch(err){
        return res.status(400).send({ message: 'Error creating new recipe'});
    }
});

//update
router.put('/:recipeId', async (req, res) => {
    res.send({ user: req.userId });
});

//delete
router.delete('/:recipeId', async (req, res) => {
    res.send({ user: req.userId });
});

module.exports = app => app.use('/recipes', router);