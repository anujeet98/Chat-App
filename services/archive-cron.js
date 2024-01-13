const { Op } = require("sequelize");
const { CronJob } = require("cron");

const ChatModel = require("../models/chat");
const ArchivedChatModel = require("../models/archived-chat")
const sequelize = require('../util/db');

module.exports = new CronJob(
    '0 0 * * *',
    function(){archiveChatsDelete();},
    null,
    false,
    'Asia/Kolkata'
);

async function archiveChatsDelete(){
    let tran;
    try{
        const date = new Date();
        date.setDate(date.getDate() - 10);
        const oldChats = await ChatModel.findAll(
            {
                where:{
                    createdAt: {
                        [Op.lt]: date
                    }
                }
            }
        );
        
        tran = await sequelize.transaction();
        await new Promise((resolve, reject) => {
            oldChats.forEach(async chat => {
                await ArchivedChatModel.create({id: chat.id, message: chat.message, isFile: chat.isFile, createdAt: chat.createdAt, userId: chat.userId, groupId: chat.groupId});
                await chat.destroy();
            });
            resolve();
        });

        await tran.commit();
        console.log(`archive-chat-cron-job date :: ${new Date()} - Chats cleared count :: ${oldChats.length}`);
    }
    catch(err){
        if(tran)
            await tran.rollback();
        console.error(`cron-job-date: ${date} ArchiveChatDelete-Error: `,err);
    }
}