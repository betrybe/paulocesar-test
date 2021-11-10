const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.json');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if( !authHeader ) {
        return res.status(401).send({ message: 'missing auth token' });
    }

    const parts = authHeader.split(' ');

    if ( !parts.lenght === 2 ) {
        return res.status(401).send({ message: 'jwt malformed' });
    }

    const [scheme, token] = parts;

    if( !/^Bearer$/i.test(scheme) ){
        return res.status(401).send({ message: 'jwt malformed' });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        //console.log(err);
        if(err) {
            return res.status(401).send({ message: 'jwt malformed' });
        }

        req.userId = decoded.id;
        req.role = decoded.role;
        req.email = decoded.email;
        
        return next();

    });
    
};