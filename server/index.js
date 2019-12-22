const express = require('express');
// const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');

const port = 4001;

const app = express();
const server = http.createServer(app);
// Q: What's the diff between app and server?

const model = require('./model.js');

const io = socketIO(server);

function setNewPlayerRoom(playerId) {
  console.log('newPlayerRoom:', playerId);
  const playerRoom = io.sockets.in(buildPlayerRoom(playerId));

  playerRoom.on('join', (coisas, mais) => {
    console.log('join default:', coisas, mais);
  });

  playerRoom.on('joined', (coisas, mais) => {
    console.log('joined manual:', coisas, mais);
  });
}

const buildPlayerRoom = playerId => `player/${playerId}`;

io.use(function(socket, next) {
  const { playerId, gameId } = socket.handshake.query || {};
  console.log('New socket:', playerId, gameId, socket.id);

  if (playerId && gameId) {
    socket.papersProfile = { playerId, gameId };
    const playerRoom = buildPlayerRoom(playerId);
    // const gameRoom = `game/${gameId}`;

    io.in(playerRoom).clients((err, clients) => {
      if (err) {
        // Q: How to handle this on client / server? :/
        return next(new Error('Auth error: missing token'));
      }
      if (!clients) {
        setNewPlayerRoom();
      }
      socket.join(playerRoom);
      next();
    });
  } else {
    console.error('New socket error - missing a token:', playerId, gameId, socket.id);

    // Q: How to handle this on client / server? :/
    return next(new Error('Auth error: missing token'));
  }
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
        cb();
        io.to(roomName).emit('game-update', room);
      });
    } catch (error) {
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

    const game = model.recoverPlayer(gameId, playerId);

    socket.join(gameId, () => {
      io.to(playerId).emit('set-game', game);
      io.to(gameId).emit('game-update', 'recover-player', playerId);
    });
  });

  socket.on('disconnect', () => {
    const { playerId, gameId } = socket.papersProfile;
    console.log('socket disconnected:', playerId, socket.id);

    verifyPlayerConnections(playerId, gameId);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// // for parsing application/json - 1mb for base64
// app.use(bodyParser.json({ limit: '1mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to socket Papers API');
});

app.use(function(req, res, next) {
  res.status(404).send('Ups, Turn back!');
});
