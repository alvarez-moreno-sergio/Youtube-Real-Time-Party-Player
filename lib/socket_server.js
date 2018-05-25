let io;
let socketsConnected = [];
let rooms = [];
let socketsInRooms = {};

exports.eventsHandler = (ioInstance, socket) => {
    io=ioInstance;
    socket.on('newClient', (data) => {
        socketsConnected.push(socket.id);
        console.log(`Connected:${socket.id}`);
    });
    socket.on('joinRoom', (data) => {
        joinRoom(socket,data);
    });
    socket.on('videoPlaying', (data) => {
        socket.to(socketsInRooms[socket.id]).emit('videoPlaying',true);
    });
    socket.on('videoPaused', (data) => {
        socket.to(socketsInRooms[socket.id]).emit('videoPaused',true);
    });
    socket.on('leaveRoom', (data) => {
        delete socketsInRooms[socket.id];
    });
    socket.on('message', (message) => {
        let room = socketsInRooms[socket.id];
        io.sockets.in(room).emit('message', {
            from: socket.id,
            message: message
        });
    });

};

function joinRoom(socket, roomName) {
    rooms.push(roomName);
    socketsInRooms[socket.id] = roomName;

    socket.join(roomName);
    console.log(`[${socket.id}] Joined to room '${roomName}'.`);
    socket.emit('joinResult', {param:`room=${roomName}`});
}

exports.rooms = rooms;

exports.getSocketsInRoom = (room) => {
    return new Promise ((resolve)=>{
        io.of('/').in(room).clients((err, clients)=>{
            if (err) throw err;
            return resolve(clients);
        });
    })
};