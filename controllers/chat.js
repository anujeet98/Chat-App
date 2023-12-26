const ChatModel = require('../models/chat');
const UserModel = require('../models/user');

module.exports.postChat = async(req, res, next)=>{
    try{
        const message = req.body.message;
        const user = req.user;
        const response = await user.createChat({message: message});
        return res.status(200).json({message: "message sent", username: user.username, response: response});
    }
    catch(err){
        console.error("PostChatError: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}

module.exports.getChats = async(req, res, next)=>{
    try{
        const response = await ChatModel.findAll({
            include: [{
                model: UserModel,
                attributes: ['username']
            }],
            attributes: ['id', 'createdAt', 'updatedAt', 'message']
        });
        res.status(200).json({thisUser: req.user.username, response:response});
    }
    catch(err){
        console.error("getChatsError: ",err);
        return res.status(500).json({error: err, message:"something went wrong"});
    }
}