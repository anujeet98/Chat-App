const { Op } = require('sequelize');
const sequelize = require('../util/db');

const UserModel = require('../models/user');
const GroupModel = require('../models/group');
const UserGroupModel = require('../models/user-group');

const inputValidator = require('../util/input-validator');



module.exports.createGroup = async(req,res,next) => {
    let tran;
    try{
        const{ groupName, groupDescription, members } = req.body;
        const user = req.user;
        if(inputValidator.text(groupName) || inputValidator.text(groupDescription) || members.length===0){
            return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-groupName/groupDescription/selectedMembers"});
        }
        
        members.push(user.id);
        members.forEach(member=>{
            if(inputValidator.number(member))
                return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-selectedMembers"});
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
    const groupId = req.query.groupId;
    if(inputValidator.number(groupId)){
        return res.status(400).json({error:"invalid input parameters", message:"invalid parameter received-GroupId"});
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


module.exports.addGroupAdmin = async(req,res,next) => {
try{
    const {memberId, groupId} = req.body;
    if(inputValidator.number(memberId) || inputValidator.number(groupId)){
        return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-memberId/GroupId"});
    }
    const result = await UserGroupModel.update(
        {isAdmin: true},
        {where: {groupId:groupId, userId:memberId}}
    );
    return res.status(200).json({message: "Member updated with Admin role"});

}
catch(err){
    console.error("addToAdmin-Error: ",err);
    return res.status(500).json({error: err, message:"something went wrong"});
}
};


module.exports.removeGroupAdmin = async(req,res,next) => {
    try{
        const {memberId, groupId} = req.body;
        if(inputValidator.number(memberId) || inputValidator.number(groupId)){
            return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-memberId/GroupId"});
        }
        const result = await UserGroupModel.update(
            {isAdmin: false},
            {where: {groupId:groupId, userId:memberId}}
        );
        return res.status(200).json({message: "Member removed from Admin role"});

    }
    catch(err){
        console.error("removeAdmin-Error: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
};


module.exports.removeUser = async(req,res,next) => {
    try{
        const {memberId, groupId} = req.query;
        if(inputValidator.number(memberId) || inputValidator.number(groupId)){
            return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-memberId/GroupId"});
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
        const{ groupId, members } = req.body;
        if(inputValidator.number(groupId) || members.length===0){
            return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received groupId/selectedMembers"});
        }
        members.forEach(member=>{
            if(inputValidator.number(member))
                return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-selectedMembers"});
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
        const {groupName, groupDescription, groupId} = req.body;
        if(inputValidator.text(groupName) || inputValidator.text(groupDescription), inputValidator.number(groupId)){
            return res.status(400).json({error:"invalid input parameters", message:"invalid parameters received-groupName/groupDescription/groupId"});
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