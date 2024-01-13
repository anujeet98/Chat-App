const AWS = require('aws-sdk');

exports.uploadToS3 = (filename, data) => {
    const awsS3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET,
    });

    return new Promise((resolve, reject)=>{
            awsS3.upload({
                Key: filename,
                Body: data,
                Bucket: process.env.AWS_S3_BUCKET,
                ACL: 'public-read'
            }, (err, result)=>{
                if(err){
                    console.log('something went wrong', err);
                    reject();
                }
                else{
                    // console.log('success', result);
                    resolve(result.Location);
                }
            });
    });
}

