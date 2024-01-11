const { Op,literal } = require('sequelize');
const bcrypt = require('bcrypt');
const Cryptr = require('cryptr');

const User = require('../models/user');
const inputValidator = require('../util/input-validator');
const tokenGenereator = require('../util/jwt-token-generator'); 
const Chat = require('../models/chat');



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
                const encryptedUserEmail = cryptr.encrypt(existingUser.email)
                const jwtToken = tokenGenereator({userId: encryptedId, userEmail: encryptedUserEmail});
                return res.status(201).json({token: jwtToken, message: "User login successful"});
            }
            else
                return res.status(401).json({message: "Incorrect user password.\nUser not authenticated."});
        }
        res.status(404).json({message: "User not found"});
    }
    catch(err){
        console.log('SignUp-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}


module.exports.getUserInfo = async(req, res, next) => {
    try{
        const user = req.user;
        res.status(200).json({userid:user.id ,username: user.username});
    }
    catch(err){
        console.log('getUserInfo-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
};


module.exports.getUsers = async(req, res, next) => {
    try{
        const allUsers = await User.findAll({
            attributes: ['id', 'username'], 
            where: {
                id: {
                    [Op.notIn]: [req.user.id]
                }
            }
        });
        res.status(200).json(allUsers);
    }
    catch(err){
        console.log('getUsers-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}



module.exports.getGroups = async(req, res, next) => {
    try{
        const user = req.user;
        const groups = await user.getGroups({attributes:['id','name']});
        res.status(200).json({groups: groups, username: user.username, message:"success"});
    }
    catch(err){
        console.log('fetchGroups-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}

module.exports.getGroupChats = async(req, res, next) => {
    try{
        const user = req.user;
        const groups = await user.getGroups();
        const groupIds = groups.map(group => group.id);
        const chats = await Chat.findAll({
            attributes: ['message','createdAt', 'userId','groupId',[literal('(SELECT `username` FROM `users` WHERE `users`.`id` = `chat`.`userId`)'), 'username']],
            where: {
                groupId: {
                    [Op.in]: groupIds
                }
            },
            order: [['groupId','ASC'],['createdAt', 'ASC']]
        });
        res.status(200).json({groupChats: chats});
    }
    catch(err){
        console.log('fetchGroups-Error: ',err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}
