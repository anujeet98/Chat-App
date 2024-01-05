const { Op} = require('sequelize');

const ChatModel = require('../models/chat');
const UserModel = require('../models/user');
const GroupModel = require('../models/group');
const UserGroupModel = require('../models/user-group');

const inputValidator = require('../util/input-validator');

module.exports.postChat = async(req, res, next)=>{
    try{
        const {message, groupId} = req.body;
        const user = req.user;
        if(inputValidator.text(message) || inputValidator.number(groupId))
            return res.status(400).json({error: "bad input parameters", message: "invalid input provided"});
        
        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }

        const response = await user.createChat({message: message, groupId: groupId});
        
        return res.status(200).json({message: "message sent success"});
    }
    catch(err){
        console.error("PostChat-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}

module.exports.getChats = async(req, res, next)=>{
    try{
        const lastMessageId = req.query.lastMessageId;
        const groupId = req.query.groupId;
        const user = req.user;
        if(inputValidator.number(lastMessageId) || inputValidator.number(groupId)){
            return res.status(400).json({error: "bad input parameters", message: "invalid input provided"});
        }

        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }

        const response = await ChatModel.findAll({
            include: [{
                model: UserModel,
                attributes: ['username','id']
            }],
            attributes: ['id', 'createdAt', 'updatedAt', 'message', 'groupId'],
            where: { 
                id: {
                    [Op.gt]: lastMessageId
                },
                groupId: groupId
            }
        });

        res.status(200).json({thisUser: req.user.username, userId: req.user.id, groupId:groupId, messageInfo:response});
    }
    catch(err){
        console.error("getChats-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}
