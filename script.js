// Import dependencies
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

// Set up the app and server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/task-assignment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Create a schema and model for tasks
const taskSchema = new mongoose.Schema({
  description: String,
  assignee: String,
});
const Task = mongoose.model('Task', taskSchema);

// Socket.io event handling
io.on('connection', socket => {
  console.log('A user connected');

  // Handle task assignment
  socket.on('assignTask', data => {
    const { description, assignee } = data;

    const newTask = new Task({
      description,
      assignee,
    });

    newTask.save((err, task) => {
      if (err) {
        console.error('Error saving task:', err);
        return;
      }

      // Broadcast the new task to all connected clients
      io.emit('newTask', task);
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
