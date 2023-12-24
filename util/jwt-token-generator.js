const jwt = require('jsonwebtoken');

module.exports = (payload)=>{
    return jwt.sign(payload, process.env.TOKEN_SECRET);   
}