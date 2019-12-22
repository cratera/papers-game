const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const http = require('http');
const socketIO = require('socket.io');

const model = require('./model.js');

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
  const io = socketIO(server);
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
  // app.get('*', function(request, response) {
  //   response.sendFile(path.resolve(__dirname, clientDir, 'index.html'));
  // });

  // Q: Why both app and server cannot listen to PORT? What's the diff?
  // app.listen(PORT, function() {
  //   console.error(
  //     `Node ${
  //       isDev ? 'dev server' : 'cluster worker ' + process.pid
  //     }: listening on port ${PORT}`
  //   );
  // });

  // app.get('/', (req, res) => {
  //   res.send('Welcome to socket Papers API');
  // });

  // app.use(function(req, res, next) {
  //   res.status(404).send('Ups, Turn back!');
  // });

  // ============= PAPERS GAME SOCKET API ============= //

  const buildPlayerRoom = playerId => `player/${playerId}`;

  io.use(function(socket, next) {
    const { playerId, gameId } = socket.handshake.query || {};
    console.log('New socket:', playerId, gameId, socket.id);
    socket.papersProfile = { playerId: 1, gameId: 2 };

    next();
    // if (playerId && gameId) {
    //   socket.papersProfile = { playerId, gameId };
    //   const playerRoom = buildPlayerRoom(playerId);
    //   // const gameRoom = `game/${gameId}`;

    //   io.in(playerRoom).clients((err, clients) => {
    //     if (err) {
    //       // Q: How to handle this on client / server? :/
    //       return next(new Error('Auth error: missing token'));
    //     }
    //     if (!clients) {
    //       setNewPlayerRoom();
    //     }
    //     socket.join(playerRoom);
    //     next();
    //   });
    // } else {
    //   console.error('New socket error - missing a token:', playerId, gameId, socket.id);

    //   // Q: How to handle this on client / server? :/
    //   return next(new Error('Auth error: missing token'));
    // }
  }).on('connection', socket => {
    socket.emit('opened');

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
          dontBelong: () => cb(new Error('dontBelong')),
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
          io.to(socket.id).emit('set-game', game);
          io.to(gameId).emit('game-update', 'new-player', player);
          cb(null, game);
        });
      } catch (error) {
        console.error('Failed to create game', error);
        cb(error);
      }
    });

    socket.on('leave-room', ({ gameId, playerId }, cb) => {
      console.log('leave-room', gameId, playerId);
      try {
        const room = model.leaveRoom(gameId, playerId);
        socket.leave(gameId, () => {
          cb();
          io.to(gameId).emit('game-update', room);
        });
      } catch (error) {
        console.error('Failed to leave room.', error);
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
      const playerRoom = buildPlayerRoom(playerId);

      socket.leave(playerRoom, () => {
        io.in(playerRoom).clients((err, clients) => {
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

    socket.on('recover-player', () => {
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
        cb(error);
      }
    });

    socket.on('disconnect', () => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('socket disconnected:', playerId, socket.id);

      verifyPlayerConnections(playerId, gameId);
    });
  });
}
