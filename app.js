const express = require('express');
let app = express();
const api = require('./API/app_api');
const http = require('http').Server(app);
const io = require('socket.io').listen(http);
const socketServer = require('./lib/socket_server');
const port = process.env.PORT || 80;
app.use(express.static('./views'));

io.on('connection', function (socket) {
    socketServer.eventsHandler(socket);
});

api.init(app);
http.listen(port, function () {
    console.log(`http listening on port: ${port}`);
});


