const socket = io();
socket.reconnect = false;

const msgTyping = document.querySelector('#msg-typing');
const msgContainer = document.querySelector('#msg-container');
const msg = document.querySelector('#msg');
const snd = document.querySelector('#snd');
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');
const onlineUsers = document.querySelector('#online-users');
const body = document.querySelector('body');

document.addEventListener('DOMContentLoaded', (event) => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    msg.select();
});

let timeout = window.setTimeout(
    () => {
        msgTyping.textContent = '';
    }, 0
);

const createMsg = function(username, message, time, color){
    let cloud = document.createElement('div');
    let paragraph = document.createElement('p');
    let span = document.createElement('span');
    span.textContent = username + ' : ';
    span.setAttribute('id', 'span-username');
    paragraph.appendChild(span);
    paragraph.insertAdjacentText('beforeend', message);
    let timeTag = document.createElement('time');
    timeTag.textContent = time;
    timeTag.setAttribute('id', 'time');
    paragraph.appendChild(timeTag);
    cloud.appendChild(paragraph);
    cloud.setAttribute('class', color);
    msgContainer.appendChild(cloud);
    msg.value = '';
    msg.select();
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

const sendMsg = function(){
    if(msg.value.trim() !== ''){
        let date = new Date();
        let hours = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
        let minutes = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        let time = hours + ':' + minutes;
        socket.emit('msg-server', {username, room, msg : msg.value, time});
        createMsg(username, msg.value, time, 'me');
    }
}

const userRoom = function(username, msg){
    let div = document.createElement('div');
    div.textContent = "L'utente " + username + msg;
    div.setAttribute('class', 'join-room');
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
};

msg.addEventListener('keydown', (e) => {
    if(e.keyCode === 13){
        sendMsg();
    }else{
        socket.emit('typing', {username, room});
    }
});
snd.addEventListener('click', sendMsg);

socket.on('connect', () => {
    socket.emit('set-room', {username, room});
});

socket.on('typing', (data) => {
    window.clearTimeout(timeout);
    msgTyping.textContent = data.username + " sta scrivendo...";
    timeout = window.setTimeout(() => {
        msgTyping.textContent = ''
    }, 2000);
});

socket.on('msg', (data) => {
    msgTyping.textContent = '';
    createMsg(data.username, data.msg, data.time, 'others');
});

socket.on('online-users', (data) => {
    onlineUsers.textContent = '';
    Object.values(data.online).forEach(username => {
        onlineUsers.textContent += username + ',';
    });
    onlineUsers.textContent = onlineUsers.textContent.replace(/.$/,".");
});

socket.on("joined room", (data) => {
    userRoom(data.username, ' si è aggiunto alla stanza');
});

socket.on("unjoined room", (data) => {
    userRoom(data.username, ' ha lasciato la stanza');
});