const socket = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
let socketServer;

module.exports = {
    socketServerConfig: (server) => {
        io = socket(server,{
            cors: {
                origin: JSON.parse(`${process.env.ACCEPTED_ORIGINS}`)
            }
        });
        socketServer = io;   //to be accessible for https calls via controller

        io.on("connection", socket => {
            return module.exports.socketService(io,socket);
        });
        instrument(io, { auth: false });
    },

    socketService: (io, socket) => {

        socket.on("join-group", (groupIds)=>{
            console.log(`====================socket ${socket.id} connected=======================`);
            groupIds.forEach(group => {
                socket.join(group);
                // console.log(`${socket.id} joined GroupId :: `,group);
            });
        })
        // socket.on("new-message", (groupId, message) => {
        //     io.to(groupId).emit("new-message", message);
            // console.log(`+++++++++ message received from ${socket.id} to ${groupId} +++++++++`,message);
        // });
        
        //   socket.on("disconnect", (reason) => {
        //     console.log(`socket ${socket.id} disconnected due to ${reason}`);
        //   });
    },


    socketServer: (groupId, msgObj) => {
        io.to(groupId).emit("new-message", msgObj);
    },
};