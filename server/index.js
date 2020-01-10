const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { transports: ['websocket'] });
const clientDir = '../client/build';

const PapersIO = require('./PapersIO.js');

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, clientDir)));

// Answer API requests.
app.get('/api', function(req, res) {
  // res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the API server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, clientDir, 'index.html'));
});

// Q: Why both app and server cannot listen to PORT? What's the diff?
// app.listen(PORT, function() {
//   console.error(
//     `Node ${
//       isDev ? 'dev server' : 'cluster worker ' + process.pid
//     }: listening on port ${PORT}`
//   );
// });

app.get('/', (req, res) => {
  res.send('Welcome to socket Papers API');
});

app.use(function(req, res, next) {
  res.status(404).send('Ups, Turn back!');
});

// ============= PAPERS GAME SOCKET API ============= //

console.log('s::::', PapersIO);
io.use((socket, next) => PapersIO.use(io, socket, next)).on('connection', socket =>
  PapersIO.connection(io, socket)
);
