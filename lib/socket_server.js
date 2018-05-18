exports.eventsHandler = function (socket) {
    socket.on('newClient', function(data){
        console.log(`Connected:${socket.id}`);
        console.log(`newClient: ${data}`);
    });
    socket.on('newLobby', function(data){
        console.log(`newLobby: ${data}`);
        joinRoom(socket,data);
    });
};

function joinRoom(socket, roomName) {
    socket.join(roomName);
    console.log(`[${socket.id}] Joined to room '${roomName}'.`);

    socket.emit('joinResult', {room:roomName});
}