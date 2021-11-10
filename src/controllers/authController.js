const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

const authConfig = require('../config/auth.json');

const User = require('../models/user.js');

const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}


router.post('/users', async (req, res) => {
    
    const { name, email, password } = req.body;

    try {

        if ( await User.findOne({ email }) )
            return res.status(409).send({ message: 'email already registered' });

        if ( !name || !email || !password )
            return res.status(400).send({ message: 'invalid entries. Try again.' });

        const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/i;
        if ( !emailRegex.test(email) )
            return res.status(400).send({ message: 'invalid entries. Try again.' });    

        const user = await User.create(req.body);

        user.password = undefined;

        return res.status(201).send({ 
            user,
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ message: 'registration failed' });
    }
});

//rota de registro de admin
router.post('/users/admin', authMiddleware, async (req, res) => {
    
    if ( req.role === 'admin' ){
    
        const { name, email, password } = req.body;

        try{

            if ( await User.findOne({ email }) )
                return res.status(409).send({ message: 'Email already registered' });

            if(!name || !email || !password)
                return res.status(400).send({ message: 'Invalid entries. Try again.' })

            //invalid email 
            const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/i;
            if ( !emailRegex.test(email) )
                return res.status(400).send({ message: 'Invalid entries. Try again.'});   

            const role = "admin";

            const newUser = {
                name:name,
                email:email,
                password:password,
                role:role
            };

            const user = await User.create(newUser);

            user.password = undefined;

            return res.status(201).send({ 
                user,
            });
        }catch(err){
            console.log(err);
            return res.status(400).send({ message: 'Registration failed' });
        }
    } else { 
        return res.status(403).send({ message: 'only admins can register new admins' });
    }
});

//rota de autenticação
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    if ( !email || !password )
        return res.status(401).send({ message: 'All fields must be filled' });

    //invalid email 
    const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/i;
    if ( !emailRegex.test(email) )
        return res.status(401).send({ message: 'Incorrect username or password' });
    
    const user = await User.findOne({ email }).select('+password');

    if ( !user )
        return res.status(401).send({ message: 'User not found' });

    if( password !== user.password) 
        return res.status(401).send({ message: 'Incorrect username or password' });


    res.status(200).send({ 
        token: generateToken({ 
            id: user.id , 
            email: user.email, 
            role: user.role
        }),
    });
    
});

module.exports = app => app.use('/', router);