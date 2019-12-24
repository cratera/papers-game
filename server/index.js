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
        socket.join(gameId, () => {
          return cb(null, { status: 'success', game });
        });
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

      // Naming: leave-game or remove-player? humm..
      try {
        const game = model.removePlayer(gameId, playerId);

        socket.leave(gameId, () => {
          cb(null);
          // Pass creatorId in case it's a new one!
          io.to(gameId).emit('game-update', 'remove-player', {
            playerId,
            creatorId: game.creatorId,
          });
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
      // CALLBACK FUCKING HELL .___.
      socket.leave(playerId, () => {
        io.in(playerId).clients((err, clients) => {
          if (err) return false;

          console.log('sockets in this playerId:', clients);

          if (clients.length === 0) {
            // There's no one, but let's wait a bit...
            // Maybe the user is refreshing the page.
            setTimeout(() => {
              // Just to scape the indents...
              doLastCheck();
            }, 2500);
          }
        });
      });

      function doLastCheck() {
        io.in(playerId).clients((err, clientsAfter) => {
          if (err) return false;

          // Let everyone know that this player is offline!
          if (clientsAfter.length === 0) {
            console.log('Player is afk:', playerId, gameId);
            try {
              const game = model.getRoom(gameId);

              // If doesnt exist, its because the user
              // emited leave-group before.
              if (game.players[playerId]) {
                model.pausePlayer(playerId, gameId);
                io.to(gameId).emit('game-update', 'pause-player', playerId);
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    }

    // Not needed yet.
    // socket.on('pause-player', () => {
    //   const { playerId, gameId } = socket.papersProfile;
    //   console.log('pause-player:', playerId, gameId, socket.id);

    //   verifyPlayerConnections(playerId, gameId);
    // });

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

    socket.on('set-words', ({ gameId, playerId, words }, cb) => {
      // OPTIMIZE: Receive/pass params as individual or {} ? Should follow a convention
      // (options: Object, callback: Function)
      // individual is mandatory, object is optional?

      // OPTMIZE: Should the playerId be passed or access through
      // socket.papersProfile? Review this later...
      // const { playerId, gameId } = socket.papersProfile;
      console.log('set-words', playerId, gameId, words);

      model.setWords(gameId, playerId, words);

      io.to(gameId).emit('game-update', 'set-words', { words, playerId });
      return cb && cb(null);
    });

    socket.on('disconnect', () => {
      const { playerId, gameId } = socket.papersProfile;
      console.log('socket disconnected:', playerId, socket.id);

      verifyPlayerConnections(playerId, gameId);
    });
  });
}
