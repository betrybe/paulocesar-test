const express = require('express');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
    cb(null, 'src/uploads');
    },
    filename: function(req, file, cb){
        console.log(req.params.recipeId);
        cb(null, req.params.recipeId+'.jpeg');
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(new Error('invalid file type'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
 });

const Recipe = require('../models/Recipe');

const router = express.Router();

//router.use(authMiddleware);

//list
router.get('/', async (req, res) => {
    try{

        //populate user -> load user information
        //const recipes = await Recipe.find().populate('user');
        
        const recipes = await Recipe.find();
        return res.status(200).send({ recipes });

    }catch(err){
        return res.status(400).send({ message: 'Error loading recipes'});
    }
});

//show
router.get('/:recipeId', async (req, res) => {
    
    try{

        //const recipe = await Recipe.findById(req.params.recipeId).populate('user');
        const recipe = await Recipe.findById(req.params.recipeId);

        return res.status(200).send({ recipe });

    }catch(err){
        return res.status(404).send({ message: 'recipe nof found'});
    }

});

//register
router.post('/', authMiddleware, async (req, res) => {
    try{

        const {name, ingredients, preparation} = req.body;
        
        if(!name || !ingredients || !preparation)
            return res.status(400).send({ message: 'Invalid entries. Try again.'})     

        const recipe = await Recipe.create({ ...req.body, user:req.userId });

        return res.status(201).send({ recipe });

    }catch(err){
        return res.status(400).send({ message: 'Error creating new recipe'});
    }
});

//update
router.put('/:recipeId', authMiddleware, async (req, res) => {
    
    try{
        
        const recipe  = await Recipe.findById(req.params.recipeId).populate('user');

        const { name, ingredients, preparation } = req.body;

        if(req.role === 'admin' || recipe.user['id'] === req.userId){
        
            const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId, {
                name,
                ingredients,
                preparation
            }, { new : true });

            return res.status(200).send({ recipe });
        }
        
        return res.status(400).send({ message: 'permission denied'});
        

    }catch(err){
        console.log(err);
        return res.status(400).send({ message: 'error updating recipe'});
    }

});

//delete
router.delete('/:recipeId', authMiddleware, async (req, res) => {
    try{

        const recipe  = await Recipe.findById(req.params.recipeId).populate('user');
        
        if(!recipe)
            return res.status(400).send({ message: 'recipe not found'});

        if(req.role === 'admin' || recipe.user['id'] === req.userId){

            await Recipe.findByIdAndRemove(req.params.recipeId);

            return res.status(204).send();
        }

        return res.status(400).send({ message: 'permission denied'});

    }catch(err){
        return res.status(400).send({ message: 'Error deleting recipe'});
    }
});

//add image
router.post('/:recipeId/image', authMiddleware, upload.single('image') , async (req, res) => {

    console.log(req.file);

    var recipe  = await Recipe.findById(req.params.recipeId).populate('user');

    const imageURL = 'localhost:3000/'+req.file.path;

    if(req.role === 'admin' || recipe.user['id'] === req.userId){
        
        recipe  = await Recipe.findById(req.params.recipeId);

        recipe.imgURL = imageURL;

        await recipe.save();

        /*const recipe = await Recipe.findByIdAndUpdate(req.params.recipeId, {
            recipeWithImg
        }, { new : true });*/
        //console.log(imageURL);
        //Recipe.updateOne({id}, {imgUrl : imageURL});
        
        return res.status(200).send({recipe});
    }else{
        return res.status(400).send({message: 'premission denied'});
    }


});

module.exports = app => app.use('/recipes', router);