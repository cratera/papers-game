const utils = require('./utils');

// Q: This works fine locally, but not on Heroku. Why?
// I know it's a bad practice, but I don't know DB yet,
// so... one thing at the time.
const games = {};

function getRoom(name, playerId) {
  const game = games[name];

  if (!game) {
    throw String('notFound');
  }

  // In the future, add auth?
  // if (!game.players[playerId]) {
  //   throw 'dontBelong';
  // }

  return game;
}

function createGame(name, creator) {
  if (games[name]) {
    throw 'exists';
  }

  const game = {
    // id: utils.createUniqueId(`game_${name}`), // TODO - use id instead of name.
    name: utils.stringToSlug(name),
    creatorId: creator.id,
    players: {
      [creator.id]: creator,
    },
    words: {
      // [playerId]: Number || [String]
      // - Number: the user is still writing their words.
      // - Array: list of words - the user submitted their words.
    },
    settings: {
      rounds: 3,
      words: 10,
    },
  };

  games[name] = game;

  return games[name];
}

function joinGame(name, playerJoining) {
  const game = games[name];

  if (!game) {
    throw String('notFound');
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
    throw String('notFound');
  }

  game.players[playerId].isAfk = false;

  return game;
}

function removePlayer(name, playerId) {
  const game = games[name];

  if (!game) {
    throw String('notFound');
  }

  const otherPlayers = Object.keys(game.players).reduce((acc, p) => {
    return p === playerId ? acc : { ...acc, [p]: game.players[p] };
  }, {});

  game.players = otherPlayers;

  // Set a new admin in case this was the one leaving.
  if (game.creatorId === playerId) {
    // The new admin is the oldest player.
    game.creatorId = Object.keys(otherPlayers)[0];
  }

  return game;
}

function killGame(name, creatorId) {
  const game = games[name];

  if (!game) {
    throw String('notFound');
  }

  if (creatorId === game.creator) {
    // Q: how overcome this?
    delete games[name];
  }

  return null;
}

function setWords(name, playerId, words) {
  const game = games[name];

  if (!game) {
    throw String('notFound');
  }

  game.words[playerId] = words;

  return game;
}

module.exports = {
  getRoom,
  createGame,
  joinGame,
  removePlayer,
  killGame,
  pausePlayer,
  recoverPlayer,
  setWords,
};
