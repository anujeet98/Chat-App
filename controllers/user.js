const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');

const User = require('../models/user');
const inputValidator = require('../util/input-validator');
const tokenGenereator = require('../util/jwt-token-generator'); 



module.exports.signup = async(req,res,next) => {
    try{
        const {username, email, phone, password} = req.body;
        if(inputValidator.text(username), inputValidator.text(email), inputValidator.text(phone), inputValidator.text(password)){
            return res.status(400).json({error: "bad input parameters", message: "Invalid input received"});
        }

        const existingUser = await User.findOne({where: {email: email}});
        if(existingUser){
            return res.status(400).json({message: "Email already exists.\nKindly login with your credentials"});
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({username: username, email: email, phone: phone, password: hash});
        res.status(201).json({message: "User added successfully"});
    }
    catch(err){
        console.log('SignUp-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"})
    }
}


module.exports.signin = async(req,res,next) => {
    try{
        const {email_phone, password} = req.body;
        if(inputValidator.text(email_phone), inputValidator.text(password)){
            return res.status(400).json({error: "bad input parameters", message: "Invalid input received"});
        }
        const existingUser = await User.findOne({
            where: {
                [Op.or]: {
                    email: email_phone,
                    phone: email_phone,
                },
            }
        });    
        if(existingUser){
            const passwordMatch = await bcrypt.compare(password, existingUser.password);
            if(passwordMatch){
                const cryptr = new Cryptr(process.env.CRYPT_SECRET);
                const encryptedId = cryptr.encrypt(existingUser.id);
                const jwtToken = tokenGenereator({userId: encryptedId});
                return res.status(201).json({token: jwtToken, message: "User login successful"});
            }
            else
                return res.status(401).json({message: "Incorrect user password.\nUser not authenticated."});
        }
        res.status(404).json({message: "User not found"});
    }
    catch(err){
        console.log('SignUp-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"})
    }
}