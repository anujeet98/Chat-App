

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