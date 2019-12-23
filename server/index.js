const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const http = require('http');
const socketIO = require('socket.io');

const model = require('./model.js');

console.log(':::: Reading server/index.js');

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server, { transports: ['websocket'] });
  const clientDir = '../client/build';

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

  function setNewPlayerRoom(playerId) {
    console.log('newPlayerRoom:', playerId);
    const playerRoom = io.sockets.in(playerId);

    playerRoom.on('join', (coisas, mais) => {
      console.log('join default:', coisas, mais);
    });

    playerRoom.on('joined', (coisas, mais) => {
      console.log('joined manual:', coisas, mais);
    });
  }

  io.use(function(socket, next) {
    const { playerId, gameId } = socket.handshake.query || {};
    console.log('New socket:', playerId, gameId, socket.id);

    io.clients((error, clients) => {
      if (error) throw error;
      console.log('clients connected:', clients); // => [String]
    });

    if (playerId && gameId) {
      socket.papersProfile = { playerId, gameId };

      io.in(playerId).clients((err, clients) => {
        if (err) {
          // Q: How to handle this on client / server? :/
          return next(new Error('Auth error: missing token'));
        }

        if (!clients) {
          setNewPlayerRoom();
        }
        socket.join(playerId, () => {
          console.log('[socket] joined the [playerId] room:', socket.id, playerId);
        });
        next();
      });
    } else {
      // Q: How to handle this on client / server? :/
      console.error('New socket error - missing a token:', playerId, gameId, socket.id);

      // return next(new Error('Auth error: missing token'));
    }
  }).on('connection', socket => {
    socket.emit('connect');

    socket.on('recover-game', cb => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('recover-game', playerId, gameId);

      if (!gameId) {
        return cb(new Error('notFound'));
      }

      try {
        const game = model.getRoom(gameId, playerId);
        return cb(null, { status: 'success', game });
      } catch (error) {
        const status = {
          // dontBelong: () => cb(new Error('dontBelong')),
          notFound: () => cb(new Error('notFound')),
          ups: () => {
            cb(new Error('notFound'));
          },
        };

        return (status[error] || status.ups)();
      }
    });

    socket.on('create-game', ({ gameId, player }, cb) => {
      console.log('create-game', gameId, player.name);

      try {
        const game = model.createGame(gameId, player);

        socket.join(gameId, () => {
          socket.papersProfile.gameId = gameId;
          io.to(gameId).emit('set-game', game);
          cb(null, game);
        });
      } catch (error) {
        console.error('Failed to create game, error:', error);
        cb(error);
      }
    });

    socket.on('join-game', ({ gameId, player }, cb) => {
      console.log('join-game', gameId, player.id);

      try {
        const game = model.joinGame(gameId, player);

        socket.join(gameId, () => {
          socket.papersProfile.gameId = gameId;
          // Update similar sessions about the new game.
          io.to(player.id).emit('set-game', game);

          // Broadcast to the game this new player.
          socket.to(gameId).broadcast.emit('game-update', 'new-player', player);
          cb(null, game);
        });
      } catch (error) {
        console.error('Failed to join game', error);
        cb(error);
      }
    });

    socket.on('leave-game', ({ gameId, playerId }, cb) => {
      console.log('leave-game', gameId, playerId);

      try {
        model.leaveGame(gameId, playerId);
        socket.leave(gameId, () => {
          cb(null);
          io.to(gameId).emit('game-update', 'leave-player', playerId);
          socket.disconnect();
        });
      } catch (error) {
        console.error('Failed to leave room.', error);
        cb(error);
      }
    });

    socket.on('kill-room', ({ roomName, creatorId }, cb) => {
      console.log('kill-room', roomName, 'by', creatorId);
      try {
        const room = model.killRoom(roomName, creatorId);
        socket.leave(roomName, () => {
          cb(null);
          io.to(roomName).emit('game-update', room);
        });
      } catch (error) {
        cb(error);
        console.error('Failed to leave room.', error);
      }
    });

    function verifyPlayerConnections(playerId, gameId) {
      socket.leave(playerId, () => {
        io.in(playerId).clients((err, clients) => {
          if (err) return false;

          console.log('clients after leave:', clients);

          if (clients.length === 0) {
            // Let everyone know that this player went offline!
            console.log('Player is afk:', playerId, gameId);
            model.pausePlayer(playerId, gameId);
            io.to(gameId).emit('game-update', 'pause-player', playerId);
          }
        });
      });
    }

    socket.on('pause-player', () => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('pause-player:', playerId, gameId, socket.id);

      verifyPlayerConnections(playerId, gameId);
    });

    socket.on('recover-player', cb => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('recover-player', playerId, gameId);

      try {
        const game = model.recoverPlayer(gameId, playerId);

        socket.join(gameId, () => {
          io.to(playerId).emit('set-game', game);
          io.to(gameId).emit('game-update', 'recover-player', playerId);
        });
      } catch (error) {
        console.warn('Recover Player failed:', error);
        cb && cb(error);
      }
    });

    socket.on('disconnect', () => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('socket disconnected:', playerId, socket.id);

      verifyPlayerConnections(playerId, gameId);
    });
  });
}
