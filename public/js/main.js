// public/js/main.js

const messages = document.querySelector('.chat-messages');
const chatArea = document.getElementById('chat-form');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');
const owner = document.getElementById('own');
const li = document.createElement('li');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

//receiving events the server sent.
socket.on('roomUsers', ({ room, users }) => {
  displayRoomName(room);
  displayUsers(users);
});

// sends the current users in a room and the room name
socket.on('message', (message) => {
  displayMessage(message);

  // Scroll down
  messages.scrollTop = messages.scrollHeight;
});


// Message submit
chatArea.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});


function displayMessage(message) {
  if (username == message.username) {
    const div = document.createElement('div');
    div.classList.add('message-sent');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += ` <span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.messages').appendChild(div);

  } else {
    const div = document.createElement('div');
    div.classList.add('message-recieved');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += ` <span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.messages').appendChild(div);
  }

}


// Add room name to DOM
function displayRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function displayUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    li.classList.add('private-msg');
    if (username == user.username) {
      owner.innerText = "You";
    } else {
      li.innerText = user.username;
      userList.appendChild(li);
    }

  });
}
li.addEventListener('click', () => {
  messages.innerHTML = "";

  const sub = document.getElementById('send');
  sub.addEventListener('click', () => {
    let msg = document.getElementById('msg').value;
    const div = document.createElement('div');
    div.classList.add('message-sent');
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = msg;
    div.appendChild(para);
    messages.appendChild(div);

    document.getElementById('msg').value = "";
  })
});


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');

  if (leaveRoom) {
    window.location = '../index.html';
  }
});

var timeout;
var typing = false

function timeoutFunction() {
  typing = false;
  socket.emit("typing", false);
}

$('#msg').keyup(function () {
  typing = true;
  socket.emit('typing', username + ' is typing . . .');
  clearTimeout(timeout);
  timeout = setTimeout(timeoutFunction, 500);
});
socket.on('typing', function (data) {
  if (data) {
    $('.typing').html(data);
  } else {
    $('.typing').html("");
  }
});

(function () {
  const send = document.getElementById('send');
  const context = new AudioContext();
  send.onclick = () => {
    playSound();

  };
  function playSound() {
    const oscillatorNode = context.createOscillator();
    const gainNode = context.createGain();

    oscillatorNode.type = 'sine';
    oscillatorNode.frequency.setValueAtTime(150, context.currentTime);
    oscillatorNode.frequency.exponentialRampToValueAtTime(500, context.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

    oscillatorNode.connect(gainNode);
    gainNode.connect(context.destination);

    oscillatorNode.start();
    oscillatorNode.stop(context.currentTime + 0.5);
    console.log("play");
  }
}());