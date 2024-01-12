const { Socket } = require("socket.io");

module.exports = (io, socket) => {
    console.log(`====================socket ${socket.id} connected=======================`);

    socket.on("join-group", (groupIds)=>{
        groupIds.forEach(group => {
            socket.join(group);
            // console.log(`${socket.id} joined GroupId :: `,group);
        });
    })
    socket.on("new-message", (groupId, message) => {
        io.to(groupId).emit("new-message", message);
        // console.log(`+++++++++ message received from ${socket.id} to ${groupId} +++++++++`,message);
    });
    
    //   socket.on("disconnect", (reason) => {
    //     console.log(`socket ${socket.id} disconnected due to ${reason}`);
    //   });
}