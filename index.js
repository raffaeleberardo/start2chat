const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socket = require('socket.io');
const io = socket(http);
let rooms = {
    'Mindset' : {},
    'Digital Marketing' : {},
    'UX/UI Design' : {},
    'Sviluppo Web' : {},
    'Sviluppo App' : {},
    'Data Science' : {},
    'Blockchain' : {},
    'Realtà Virtuale' : {},
    'Startup' : {}
};

const roomsArray = Object.keys(rooms);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded());

//server listening
http.listen(process.env.PORT || 3000);

//routing
app.get('/', (req, res) => {
    res.render('index', {title : 'Benvenuti!', rooms : roomsArray});
});

app.get('/room', (req, res) => {
    let username = req.query.username;
    let room = typeof req.query.room !== "undefined" ? req.query.room.replace("_", " ") : '';
    if(roomsArray.includes(room)){
        res.render('room', {title : room, username, room});
    }
    else{
        res.redirect('/');
    }
});

//server socket initialization
io.on('connection', (socket) => {
    socket.on('set-room', (data) => {
        socket.join(data.room);
        rooms[data.room.replace("_", " ")][socket.id] = data.username;
        io.to(data.room).emit('online-users', {online : rooms[data.room.replace("_", " ")]});
        socket.to(data.room).emit("joined room", {username : data.username});
    });
    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', {username : data.username});
    })
    socket.on('msg-server', (data) => {
        socket.to(data.room).emit('msg', {username : data.username, msg : data.msg, time : data.time});
    });
    socket.on('disconnecting', () => {
        const roomsJoined = Object.keys(socket.rooms);
        let socketID = roomsJoined[0];
        let room = roomsJoined[1];
        socket.to(room).emit('unjoined room', {username : rooms[room.replace("_", " ")][socketID]});
        delete rooms[room.replace("_", " ")][socketID];
        socket.to(room).emit('online-users', {online : rooms[room.replace("_", " ")]});
    });
});




