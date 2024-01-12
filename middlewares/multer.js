const multer = require('multer');

module.exports.upload = multer().single('file');

// module.exports.upload = (req,res,next) => {
//     req.file = multer().single('file');
//     next();
// }
