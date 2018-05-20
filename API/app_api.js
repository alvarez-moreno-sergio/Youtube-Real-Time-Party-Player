const socket_server = require('../lib/socket_server');
exports.init = (app)=>{
    requestHandler(app);
};

function requestHandler(app){
    app.get('/api/v1/getRooms', (req,res)=>{
        res.json(socket_server.rooms);
    })
}