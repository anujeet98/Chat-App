const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const User = require('../models/user');

module.exports.authenticate = async(req, res, next) => {
    try{
        const token = req.headers.authorization;
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const cryptr = new Cryptr(process.env.CRYPT_SECRET);
        const userId = cryptr.decrypt(verifiedToken.userId);
        const verifiedUser = await User.findByPk(userId);

        if(verifiedUser){
            req.user = verifiedUser;
            next();
        }
        else
            return res.status(404).json({message: "user not verified"});

    }
    catch(err){
        if(err.name === 'JsonWebTokenError'){
            console.error('JsonWebTokenError-auth: ',err);   
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        console.error('authenticationError: ', err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}