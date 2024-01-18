const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const User = require('../models/user');
const { where } = require('sequelize');

module.exports.authenticate = async(req, res, next) => {
    try{
        const token = req.headers.authorization;
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const cryptr = new Cryptr(process.env.CRYPT_SECRET);
        const userId = cryptr.decrypt(verifiedToken.userId);
        const userEmail = cryptr.decrypt(verifiedToken.userEmail);
        const verifiedUser = await User.findOne({where: {id: userId, email: userEmail}});

        if(verifiedUser){
            req.user = verifiedUser;
            next();
        }
        else
            return res.status(404).json({error: "User not verified", message: "User not verified. \nPlease sign-in again"});

    }
    catch(err){
        if(err.name === 'JsonWebTokenError')
            return res.status(401).json({ error: 'User unauthorized', message: 'User unauthorized. \nPlease sign-in again'});
        if(err.name === 'TokenExpiredError')
            return res.status(401).json({error: 'Token expired', message: 'Authentication token expired. \nPlease sign in again'});

        console.error('authenticationError: ', err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}