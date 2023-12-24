const User = require('../models/user');
const inputValidator = require('../util/input-validator');
const bcrypt = require('bcrypt');



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