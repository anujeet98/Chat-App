const UserGroupModel = require('../models/user-group');
const inputValidator = require('../util/input-validator');

module.exports.AdminAuth = async(req, res, next) => {
    try{
        const reqUser = req.user;
        const groupId = req.query.groupId || req.body.groupId;
        if(inputValidator.number(groupId)){
            return res.status(400).json({error: "bad input parameters", message: "invalid input provided-groupId"});
        }

        const admin = await UserGroupModel.findOne({where: {groupId: groupId, userId:reqUser.id}});
        if(!admin)
            return res.status(400).json({message: "Requesting user is not a part of the group"});

        if(!admin.isAdmin)
            return res.status(403).json({message: "Requesting user is not an Admin"});
        req.isAdmin = true;
        next();
    }
    catch(err){
        console.error('AdminAuthenticationError: ', err);
        res.status(500).json({error: err, message: "something went wrong"});
    }
}