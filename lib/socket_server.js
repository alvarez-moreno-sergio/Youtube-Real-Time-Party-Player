let socketsConnected = [];
let rooms = [];
let socketsInRooms = {};

exports.eventsHandler = (socket) => {
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
};

function joinRoom(socket, roomName) {
    rooms.push(roomName);
    socketsInRooms[socket.id] = roomName;

    socket.join(roomName);
    console.log(`[${socket.id}] Joined to room '${roomName}'.`);
    socket.emit('joinResult', {param:`room=${roomName}`});
}

exports.rooms = rooms;