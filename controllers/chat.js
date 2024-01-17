const { Op, literal } = require('sequelize');
const AwsS3Service = require('../services/aws-s3-service')

const ChatModel = require('../models/chat');
const UserGroupModel = require('../models/user-group');

const inputValidator = require('../util/input-validator');

module.exports.postChatMessage = async(req, res, next)=>{
    try{
        const {message, groupId} = req.body;
        const user = req.user;
        if(inputValidator.text(message) || inputValidator.number(groupId))
            return res.status(400).json({error: "bad input parameters", message: "invalid input provided"});
        
        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }

        const response = await user.createChat({message: message, groupId: groupId, isFile: false});
        return res.status(201).json({message: "message sent success"});
    }
    catch(err){
        console.error("PostChat-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}


module.exports.postChatFile = async(req, res, next)=>{
    try{
        const {file, user} = req;
        const groupId = req.body.groupId;

        if(inputValidator.file(file) || inputValidator.number(groupId))
            return res.status(400).json({error: "bad input parameters", message: "invalid input provided. File upload max limit is 5MB"});
        
        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }

        const filename = `chatfile_${user.id}_${groupId}_${new Date()}_${file.originalname}`;
        const fileUrl = await AwsS3Service.uploadToS3(filename, file.buffer);


        const response = await user.createChat({message: fileUrl, groupId: groupId, isFile: true});
        return res.status(201).json({imageurl: fileUrl, message: "message sent success"});
    }
    catch(err){
        console.error("PostChat-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}

module.exports.getGroupChats = async(req, res, next) => {
    try{
        const user = req.user;
        const groups = await user.getGroups({attributes: ['id']});
        const chats = await ChatModel.findAll({
            attributes: ['message','createdAt', 'userId','groupId',[literal('(SELECT `username` FROM `users` WHERE `users`.`id` = `chat`.`userId`)'), 'username'], 'isFile'],
            where: {
                groupId: {
                    [Op.in]: groups.map(group => group.id)
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

// module.exports.getChats = async(req, res, next)=>{
//     try{
//         const lastMessageId = req.query.lastMessageId;
//         const groupId = req.query.groupId;
//         const user = req.user;
//         if(inputValidator.number(lastMessageId) || inputValidator.number(groupId)){
//             return res.status(400).json({error: "bad input parameters", message: "invalid input provided"});
//         }

//         const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
//         if(!userGroupCheck){
//             return res.status(403).json({message: 'user not part of the requested group'});
//         }

//         const response = await ChatModel.findAll({
//             include: [{
//                 model: UserModel,
//                 attributes: ['username','id']
//             }],
//             attributes: ['id', 'createdAt', 'updatedAt', 'message', 'groupId'],
//             where: { 
//                 id: {
//                     [Op.gt]: lastMessageId
//                 },
//                 groupId: groupId
//             }
//         });

//         res.status(200).json({thisUser: req.user.username, userId: req.user.id, groupId:groupId, messageInfo:response});
//     }
//     catch(err){
//         console.error("getChats-Error: ",err);
//         return res.status(500).json({error: err, message:"something went wrong"});
//     }
// }
