const express = require('express');
let app = express();
const http = require('http').Server(app);
const io = require('socket.io').listen(http);
const socketServer = require('./lib/socket_server');

app.use(express.static('./views'));

io.on('connection', function (socket) {
    socketServer.eventsHandler(socket);
});

http.listen(3000, function () {
    console.log('http listening');
});


