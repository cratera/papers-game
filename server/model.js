const utils = require('./utils');

const games = {};

function getRoom(name, playerId) {
  const game = games[name];

  if (!game) {
    throw 'notFound';
  }

  if (!game.players[playerId]) {
    throw 'dontBelong';
  }

  return game;
}

function createGame(name, creator) {
  if (games[name]) {
    throw 'exists';
  }

  const game = {
    // id: utils.createUniqueId(`game_${name}`), // TODO - use id instead of name.
    name: utils.stringToSlug(name),
    creator: creator.name,
    players: {
      [creator.id]: creator,
    },
    settings: {
      rounds: 3,
    },
  };

  games[name] = game;

  return games[name];
}

function joinGame(name, playerJoining) {
  const game = games[name];

  if (!game) {
    throw 'notFound';
  }

  game.players[playerJoining.id] = playerJoining;

  return game;
}

function pausePlayer(playerId, gameId) {
  // Dont need to receive gameId - access clients instead.
  const game = games[gameId];

  if (game && game.players[playerId]) {
    game.players[playerId].isAfk = true;
  }

  return game;
}

function recoverPlayer(name, playerId) {
  const game = games[name];

  if (!game) {
    console.error('rejoinGame not found', name);
    throw 'notFound';
  }

  // TODO - verify if player doesnt exist. use ?.
  game.players[playerId].isAfk = false;

  return game;
}

function leaveGame(name, playerId) {
  const game = games[name];

  if (!game) {
    throw 'notFound';
  }

  delete game.players[playerId];

  return game;
}

function killGame(name, creatorId) {
  const game = games[name];

  if (!game) {
    throw 'notFound';
  }

  if (creatorId === game.creator) {
    // Q: how overcome this?
    delete games[name];
  } else {
    throw 'notTheCreator';
  }
  return null;
}

module.exports = {
  getRoom,
  createGame,
  joinGame,
  leaveGame,
  killGame,
  pausePlayer,
  recoverPlayer,
};
