const { Op, literal } = require('sequelize');
const sequelize = require('../util/db');

const UserModel = require('../models/user');
const GroupModel = require('../models/group');
const ChatModel = require('../models/chat');
const UserGroupModel = require('../models/user-group');

const AwsS3Service = require('../services/aws-s3-service');

const inputValidator = require('../util/input-validator');

const socketService = require('../services/socket').socketServer;

module.exports.createGroup = async(req,res,next) => {
    let tran;
    try{
        const{ groupName, groupDescription, members } = req.body;
        const user = req.user;
        if(inputValidator.text(groupName) || inputValidator.text(groupDescription)){
            return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-groupName/groupDescription"});
        }
        
        members.push(user.id);
        members.forEach(member=>{
            if(inputValidator.number(member))
                return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-selectedMembers"});
        });

        tran = await sequelize.transaction();
        const [newGroup, users] = await Promise.all([
            GroupModel.create({name: groupName, description: groupDescription, createdBy: user.id}),
            UserModel.findAll({
                where: {
                    id: {
                        [Op.in]: members
                    }
                }
            })
        ]);
        const response= await newGroup.addUsers(users);
        await UserGroupModel.update({ isAdmin: true }, {where: {userId: user.id, groupId: newGroup.id}});

        await tran.commit();
        res.status(200).json({groupCreated: newGroup, userGroup: response, message: 'Group has been created.'});
    }
    catch(err){
        if(tran)
            await tran.rollback();
        console.error("createGroup-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}


module.exports.getGroupInfo = async(req,res,next) => {
try{
    const groupId = req.params.groupId;
    if(inputValidator.number(groupId)){
        return res.status(422).json({error:"invalid input parameters", message:"invalid parameter received-GroupId"});
    }
    const [groupInfo, membersInfo] = await Promise.all([
        GroupModel.findOne({where: {id: groupId}}),
        UserGroupModel.findAll({
            where: { groupId: groupId },
            attributes: ['isAdmin'],
            include: [
                {
                model: UserModel,
                attributes: ['id', 'username', 'email', 'phone'],
                },
            ],
            order: [
                ['isAdmin','DESC']
            ]
        })
    ]);

    let userIsAdmin = false;
    let members = []; 
    let reqUser; 
    const memberId = membersInfo.map(member => {
        if(member.user.id === req.user.id){
            userIsAdmin = member.isAdmin;
            reqUser = member;
        }
        else    
            members.push(member)
        return member.user.id;
    });
    members.unshift(reqUser);
    const nonMembers = await UserModel.findAll({
        attributes: ['id', 'username', 'email', 'phone'],
        where: {
            id: {
                [Op.notIn]: memberId
            }
        }
    });
    res.status(200).json({isAdmin:userIsAdmin, reqUserId: req.user.id, group: groupInfo, members: members, nonMembers: nonMembers});
}
catch(err){
    console.error("getGroupInfo-Error: ",err);
    return res.status(500).json({error: err, message:"something went wrong"});
}
};


module.exports.updateAdminStatus = async(req,res,next) => {
    try{
        const {memberId, groupId} = req.params;
        const { adminAction } = req.body;
        if(inputValidator.number(memberId) || inputValidator.number(groupId)){
            return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-memberId/GroupId"});
        }

        if(adminAction === 'add'){
            await UserGroupModel.update(
                {isAdmin: true},
                {where: {groupId:groupId, userId:memberId}}
            );
            return res.status(200).json({message: "Member updated with Admin role"});
        }   
        else if (adminAction === 'remove') {
            await UserGroupModel.update(
                {isAdmin: false},
                {where: {groupId:groupId, userId:memberId}}
            );
            return res.status(200).json({message: "Member removed from Admin role"});
        }
        
        return res.status(422).json({ error: 'Invalid action specified', message: 'Invalid adminAction specified'});
    }
    catch(err){
        console.error("updateAdminStatus-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
};



module.exports.removeUser = async(req,res,next) => {
    try{
        const {groupId, memberId} = req.params;
        if(inputValidator.number(memberId) || inputValidator.number(groupId)){
            return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-memberId/GroupId"});
        }

        const result = await UserGroupModel.destroy({where: {groupId: groupId, userId: memberId}});
        return res.status(200).json({message: "Member removed from the group", afectedUserCount: result});
    }
    catch(err){
        console.error("removeUser-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}

module.exports.addUsers = async(req,res,next) => {
    try{
        const{ members } = req.body;
        const groupId = req.params.groupId;
        if(inputValidator.number(groupId) || members.length===0){
            return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received groupId/selectedMembers"});
        }
        members.forEach(member=>{
            if(inputValidator.number(member))
                return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-selectedMembers"});
        });

        const [group, users] = await Promise.all([
            GroupModel.findOne({where: {id:groupId}}),
            UserModel.findAll({
                where: {
                    id: {
                        [Op.in]: members
                    }
                }
            })
        ]);

        if(!users)
            return res.status(404).json({error:"invalid input parameters", message:"Users not found"});
        if(!group)
            return res.status(404).json({error:"invalid input parameters", message:"Group not found"})

        await group.addUsers(users);
        return res.status(200).json({message: "users added successfully"});
    }
    catch(err){
        console.error("addUsers-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}


module.exports.updateGroup = async(req,res,next) => {
    try{
        const {groupName, groupDescription} = req.body;
        const groupId = req.params.groupId;
        if(inputValidator.text(groupName) || inputValidator.text(groupDescription), inputValidator.number(groupId)){
            return res.status(422).json({error:"invalid input parameters", message:"invalid parameters received-groupName/groupDescription/groupId"});
        }

        const group = await GroupModel.findOne({where: {id: groupId}})
        if(!group)
            return res.status(404).json({message: "Group not found"});

        //else update group name and descr
        group.name = groupName;
        group.description = groupDescription;
        await group.save();
        return res.status(200).json({message: "Group update success"});
    }
    catch(err){
        console.error("updateGroup-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}



module.exports.postTextMessage = async(req, res, next)=>{
    try{
        const message = req.body.message;
        const groupId = +req.params.groupId;
        const user = req.user;
        if(inputValidator.text(message) || inputValidator.number(groupId))
            return res.status(422).json({error: "bad input parameters", message: "invalid input provided"});
        
        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }
        const response = await user.createChat({message: message, groupId: groupId, isFile: false, createdAt: new Date()});

        const msgObj = {
            message: response.dataValues.message,
            createdAt: response.createdAt.toString().substring(4,21),
            userId: response.dataValues.userId,
            groupId: groupId,
            username: req.user.username,
            isFile: response.dataValues.isFile
        }

        socketService(groupId, msgObj);

        return res.status(201).json({message: "message sent success"});
    }
    catch(err){
        console.error("PostChat-Text-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}


module.exports.postFileMessage = async(req, res, next)=>{
    try{
        const {file, user} = req;
        const groupId = +req.params.groupId;

        if(inputValidator.file(file) || inputValidator.number(groupId))
            return res.status(422).json({error: "bad input parameters", message: "invalid input provided. File upload max limit is 5MB"});
        
        const userGroupCheck = await UserGroupModel.findOne({where: {groupId: groupId, userId: user.id}});
        if(!userGroupCheck){
            return res.status(403).json({message: 'user not part of the requested group'});
        }
        //filename shrotened to 20char or less from the end
        const filename = `chatfile_${user.id}_${groupId}_${new Date().toString()}_${file.originalname.length>20?file.originalname.substring(file.originalname.length-20):file.originalname}`;
        const fileUrl = await AwsS3Service.uploadToS3(filename, file.buffer, file.mimetype);


        const response = await user.createChat({message: fileUrl, groupId: groupId, isFile: true, createdAt: new Date()});

        const msgObj = {
            message: response.dataValues.message,
            createdAt: response.createdAt.toString().substring(4,21),
            userId: response.dataValues.userId,
            groupId: groupId,
            username: req.user.username,
            isFile: response.dataValues.isFile
        }
        socketService(groupId, msgObj);

        return res.status(201).json({message: "message sent success"});
    }
    catch(err){
        console.error("PostChat-File-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}

module.exports.getGroupMessages = async(req, res, next) => {
    try{
        const user = req.user;
        const groups = await user.getGroups({attributes: ['id']});
        let chats = await ChatModel.findAll({
            attributes: ['message','createdAt', 'userId','groupId',[literal('(SELECT `username` FROM `users` WHERE `users`.`id` = `chat`.`userId`)'), 'username'], 'isFile'],
            where: {
                groupId: {
                    [Op.in]: groups.map(group => group.id)
                }
            },
            order: [['groupId','ASC'],['createdAt', 'ASC']]
        });

        //Date Formating
        chats = chats.map(chat => {
            return {
                ...chat.dataValues,
                createdAt: chat.createdAt.toString().substring(4, 21)
            };
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