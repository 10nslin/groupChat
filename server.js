var express = require('express');
var path = require('path');
var app = express();

var server = app.listen(8000, function() {
    console.log("listening on port 8000");
   });

var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, "./static")));

users=[];
connections=[];

app.get('/', function(req, res){
    res.render('index');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Made Socket Connection', connections.length);

    //Send Message
    socket.on('send_message', function(data){
        console.log(data);
        io.sockets.emit('new_message',{msg: data, user: socket.username});
    })
    //New User
    socket.on('new_user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();

    });
    function updateUserNames(){
        io.sockets.emit('get_users', users);
    }
    
    //Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
});
