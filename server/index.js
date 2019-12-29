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
    console.log('|| New socket:', playerId, gameId, socket.id);

    // io.clients((error, clients) => {
    //   if (error) throw error;
    //   console.log('clients connected:', clients); // => [String]
    // });

    if (playerId && gameId) {
      socket.papersProfile = { playerId, gameId };

      io.to(playerId).clients((err, clients) => {
        if (err) {
          // Q: How to handle this on client / server? :/
          return next(new Error('Auth error: getting clients'));
        }

        socket.join(playerId, () => {
          console.log('|| - Joined the playerId room:', socket.id, playerId);
        });
        next();
      });
    } else {
      // Q: How to handle this on client / server? :/
      console.error('|| - New socket error - missing a token:', playerId, gameId, socket.id);

      // return next(new Error('Auth error: missing token'));
    }
  }).on('connection', socket => {
    // TODO - connect on client, and trigger recover there,
    // otherwise, on iPhone unblock, it doesnt connect
    // to the other clients unless the player client.
    socket.emit('connect');

    function verifyPlayerConnections(playerId, gameId) {
      // CALLBACK FUCKING HELL .___.
      socket.leave(playerId, () => {
        io.in(playerId).clients((err, clients) => {
          if (err) return false;

          console.log(':: - sockets in this playerId:', clients);

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
            try {
              const game = model.getGame(gameId);

              if (game.players[playerId]) {
                console.log('Player is afk:', playerId, gameId);
                model.pausePlayer(playerId, gameId);
                io.to(gameId).emit('game-update', 'pause-player', playerId);
              } else {
                // If doesnt exist, its because the user
                // emited leave-game before.
                console.log('Player left:', playerId, gameId);
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    }

    socket.on('recover-game', cb => {
      const { playerId, gameId } = socket.papersProfile;
      console.log(':: recover-game', playerId, gameId);

      if (!gameId) {
        return cb(new Error('notFound'));
      }

      try {
        const game = model.getGame(gameId, playerId);
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
      console.log(':: create-game', gameId, player.id);

      try {
        const game = model.createGame(gameId, player);

        socket.join(gameId, () => {
          socket.papersProfile.gameId = gameId;
          io.to(gameId).emit('set-game', game);
          cb(null, game);
        });
      } catch (error) {
        console.error('Failed to create game:', error);
        cb(error);
      }
    });

    socket.on('join-game', ({ gameId, player }, cb) => {
      console.log(':: join-game', gameId, player.id);

      try {
        const game = model.joinGame(gameId, player);

        socket.join(gameId, () => {
          socket.papersProfile.gameId = gameId;
          // Update similar sessions about the new game.
          io.to(player.id).emit('set-game', game);

          // Broadcast to the game this new player.
          socket.to(gameId).emit('game-update', 'new-player', player);
          cb(null, game);
        });
      } catch (error) {
        console.error('Failed to join game:', error);
        cb(error);
      }
    });

    socket.on('leave-game', ({ gameId, playerId }, cb) => {
      console.log(':: leave-game', gameId, playerId);

      // Naming: leave-game or remove-player? humm..
      try {
        const game = model.removePlayer(gameId, playerId);

        io.to(playerId).emit('leave-game');

        if (!game) {
          console.log(':: - Last player leaving. Game deleted');
          return;
        }

        socket.leave(gameId, () => {
          socket.to(gameId).emit('game-update', 'remove-player', {
            playerId,
            // Pass creatorId in case it's a new one!
            creatorId: game.creatorId,
            // TODO - Pass new round in case its needed a new update
            // round
          });
          socket.disconnect();
        });
        cb(null);
      } catch (error) {
        console.error('Failed to leave room:', error);
        cb(error);
      }
    });

    socket.on('recover-player', cb => {
      const { playerId, gameId } = socket.papersProfile;
      console.log(':: recover-player', playerId, gameId);

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

    socket.on('kickout-of-game', ({ gameId, playerId }, cb) => {
      console.log(':: kickout-of-game', gameId, playerId);

      try {
        const game = model.removePlayer(gameId, playerId);

        io.to(playerId).emit('kickouted');

        if (game) {
          // Pass creatorId in case it's a new one!
          io.to(gameId).emit('game-update', 'remove-player', {
            playerId,
            creatorId: game.creatorId,
          });
        } else {
          // everyone already left. there's no one in the game.
        }
        cb(null);
      } catch (error) {
        console.error('Failed to kickout:', error);
        cb(error);
      }
    });

    socket.on('kill-room', ({ roomName, creatorId }, cb) => {
      console.log(':: kill-room', roomName, 'by', creatorId);
      try {
        const room = model.killRoom(roomName, creatorId);
        socket.leave(roomName, () => {
          cb(null);
          io.to(roomName).emit('game-update', room);
        });
      } catch (error) {
        cb(error);
        console.error('Failed to leave room:', error);
      }
    });

    socket.on('set-teams', ({ gameId, playerId, teams }, cb) => {
      console.log(':: set-teams', playerId, gameId, teams);

      model.setTeams(gameId, teams);

      io.to(gameId).emit('game-update', 'set-teams', teams);
      return cb && cb(null);
    });

    socket.on('set-words', ({ gameId, playerId, words }, cb) => {
      // OPTIMIZE: Receive/pass params as individual or {} ? Should follow a convention
      // (options: Object, callback: Function)
      // individual is mandatory, object is optional?

      // OPTMIZE/REVIEW: Should the playerId be passed or access through
      // Maybe it should be passed, to support local multiplayer.
      // const { playerId, gameId } = socket.papersProfile;
      console.log(':: set-words', playerId, gameId, words);

      model.setWords(gameId, playerId, words);

      io.to(gameId).emit('game-update', 'set-words', { words, playerId });
      return cb && cb(null);
    });

    socket.on('set-words-for-everyone', ({ gameId, playerId, allWords }) => {
      console.log('write-for-everyone 💥', playerId, gameId, allWords);

      model.setWordsForEveyone(gameId, playerId, allWords);

      io.to(gameId).emit('game-update', 'set-words-for-everyone', allWords);
    });

    socket.on('start-game', ({ gameId, playerId }, cb) => {
      console.log(':: start-game', gameId, playerId);

      try {
        const game = model.startGame(gameId);

        io.to(gameId).emit('game-update', 'start-game', {
          round: game.round,
          hasStarted: game.hasStarted,
        });
        cb && cb(null);
      } catch (error) {
        console.error('Failed to start game:', error);
        cb && cb(error);
      }
    });

    socket.on('start-turn', ({ gameId, playerId }, cb) => {
      console.log(':: start-turn', gameId, playerId);

      try {
        const game = model.startTurn(gameId);

        io.to(gameId).emit('game-update', 'start-turn', {
          status: game.round.status,
        });
        cb && cb(null);
      } catch (error) {
        console.error('Failed to start turn:', error);
        cb && cb(error);
      }
    });

    socket.on('finish-turn', ({ gameId, playerId, wordsGuessed }, cb) => {
      console.log(':: finish-turn', gameId, playerId, wordsGuessed);

      try {
        const game = model.finishTurn(gameId, wordsGuessed);

        io.to(gameId).emit('game-update', 'finish-turn', game.round);
        cb && cb(null);
      } catch (error) {
        console.error('Failed to finish turn:', error);
        cb && cb(error);
      }
    });

    // ---------

    socket.on('disconnect', () => {
      const { playerId, gameId } = socket.papersProfile;
      console.log(':: socket disconnected:', playerId, socket.id);

      verifyPlayerConnections(playerId, gameId);
    });
  });
}
