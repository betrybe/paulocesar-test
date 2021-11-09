const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const User = require('../models/User');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

//rota de registro
router.post('/users', async(req, res) => {
    
    const { name, email, password } = req.body;

    try{

        if(await User.findOne({ email }))
            return res.status(409).send({ message: 'Email already registered'});

        if(!name || !email || !password)
            return res.status(400).send({ message: 'Invalid entries. Try again.'})

        //invalid email 
        const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/i;
        if(!emailRegex.test(email))
            return res.status(400).send({ message: 'Invalid entries. Try again.'})     

        const user = await User.create(req.body);

        user.password = undefined;

        return res.status(201).send({ 
            user,
            //token: generateToken({ id: user.id }),
        });
    }catch(err){
        console.log(err);
        return res.status(400).send({ message: 'Registration failed'});
    }
});

//rota de autenticação
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password)
        return res.status(401).send({ message: 'All fields must be filled'});

    //invalid email 
    const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/i;
    if(!emailRegex.test(email))
        return res.status(401).send({ message: 'Incorrect username or password'});
    
    const user = await User.findOne({ email }).select('+password');

    if(!user)
        return res.status(401).send({ message: 'User not found'});

    if(password !== user.password)
        return res.status(401).send({ message: 'Incorrect username or password'})

    //user.password = undefined;

    res.status(200).send({ 
        //user, 
        token: generateToken({ 
            id: user.id , 
            email: user.email, 
            role: user.role
        }),
    });
    
});

//toda vez que acessar o /auth chamará esse router
module.exports = app => app.use('/', router);