// index.js

const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./helpers/formDate')
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require('./helpers/userHelper');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// this block will run when the client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    // General welcome
    // socket.emit('message', formatMessage("Chat App", 'Welcome to the Chat Applicaion!'));

    // Broadcast everytime users connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("CMD", `${user.username} has joined the room`)
      );

    // Current active users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });

  // Listen for client message
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });


  socket.on('typing', function (data) {
    socket.broadcast.emit('typing', data);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("CMD", `${user.username} has left the room`)
      );

      // Current active users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));