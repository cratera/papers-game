import * as firebase from 'firebase';
import PubSub from 'pubsub-js';
import { slugString } from '@constants/utils.js';

const firebaseConfig = {
  // TODO - remove this from source code
  apiKey: 'AIzaSyBYB6fczaHoB-SKjMRM4VHradIyLtluBHM',

  authDomain: 'papers-game.firebaseapp.com',
  databaseURL: 'https://papers-game.firebaseio.com',
  projectId: 'papers-game',
  storageBucket: 'papers-game.appspot.com',
  messagingSenderId: '381121722531',
  appId: '1:381121722531:web:5d88b1a0b418e4e8c8e716',
  measurementId: 'G-BFBZ4MNDX4',
};

let LOCAL_PROFILE = {}; // not sure if this is good.
let DB; // firebase database

const PUBLIC_API = {
  on,
  signIn,
  updateProfile, // setUser?
  resetProfile,
  getUser,

  createGame,
  joinGame,
  leaveGame,

  removePlayer,

  setTeams,
  setWords,
  setWordsForEveryone,

  startGame,
  startTurn,
  finishTurn,
  startNextRound,
};

export function serverReconnect({ id, name, gameId }) {
  if (firebase.apps.length > 0) {
    // Let's REVIEW this odd scenario later...
    console.log('⚙️ serverReconnect(), already connected!');
    return { socket: PUBLIC_API };
  }

  console.log('⚙️ serverReconnect() - doesnt exist!', LOCAL_PROFILE.id, id);

  const API = init();

  return API;
}

export default function init(options) {
  console.log('⚙️ init()');

  if (firebase.apps.length > 0) {
    console.warn('Already initialized!');
  } else {
    firebase.initializeApp(firebaseConfig);
  }

  DB = firebase.database();

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      LOCAL_PROFILE.id = user.uid;
      LOCAL_PROFILE.isAfk = false;
      console.log('⚙️ Signed!', LOCAL_PROFILE.id);

      updateProfile(LOCAL_PROFILE);
      PubSub.publish('profile.signed', LOCAL_PROFILE.id);
    } else {
      // User is signed out.
      // ...
    }
  });

  return PUBLIC_API;
}

/**
 * PubSub system. Bridge with PapersContext to subscribe to.
 * @param {string} topic - The topic to subscribe to.
 * @param {function} cb - The cb to be executed when the topic is emitted.
 * @example
 * // Topics available:
 * # 'signed'
 * - (id) - the userid from firebase.
 */
function on(topic, cb) {
  PubSub.subscribe(topic, cb);
}

// ============== AUTH / PROFILE

/**
 * Do Auth. Needed before accessing to a game
 */
function signIn({ name, avatar }, cb) {
  LOCAL_PROFILE = { name, avatar };

  firebase
    .auth()
    .signInAnonymously()
    .catch(function (error) {
      console.error('signInAnonymously error:', error);
      cb(null, error);
    });
}

/**
 * Update profile
 * @param {Object} profile - The params to update the profile
 * @param {Object} profile.id - The profile id
 * @param {Object} profile.name - The profile name
 * @param {Object} profile.avatar - The params avatar - base64
 * @param {Object} profile.gameId - The last gameid they tried to access
 */
function updateProfile(profile) {
  console.log('⚙️ updateProfile()', profile);
  DB.ref('users/' + LOCAL_PROFILE.id).update(profile);
}

/**
 * Reset profile - it deletes the profile from the db.
 */
function resetProfile(id) {
  updateProfile({
    id: null,
    name: null,
    avatar: null,
    gameId: null,
  });
}

/**
 *
 */
function getUser(userId) {
  console.log('⚙️ getUser()', LOCAL_PROFILE.id, userId);

  // var userId = firebase.auth().currentUser.uid;
  // return firebase
  //   .database()
  //   .ref('/users/' + userId)
  //   .once('value')
  //   .then(function(snapshot) {
  //     console.log('GET USER!', snapshot.val());
  //   });
}

// ============== GAME

const gameInitialState = ({ id, name, creatorId }) => ({
  id,
  name: name,
  creatorId: creatorId, // the one that will decide the flow
  hasStarted: false,
  players: {
    [creatorId]: {
      isAfk: false,
    },
  },
  words: {
    // [playerId]: [String] - list of words - the user submitted their words.
  },
  teams: {
    //   0: {
    //     id: '0', // team index
    //     name: 'Dreamers',
    //     players: [playerdId]
    //   }
    // }
  },
  round: {
    current: null, // Number - Round index
    turnWho: null, // { Number, Number, Bool } - { 0: teamIndex, 1: playerIndex, 2: isOdd }
    turnCount: 0, // Number - Turn index
    status: null, // String - 'getReady' | Date.now() | 'timesup'
    wordsLeft: null, // Array - words left to guess.
  },
  score: [
    //  Array by round for each player:
    // { [playerId1]: [wordsGuessed0...], [playerId2]: [wordsGuessed0...] },
    // { [playerId1]: [wordsGuessed1...], [playerId2]: [wordsGuessed2...] }
  ],
  settings: {
    roundsCount: 3,
    words: 10,
    time_ms: 6000, // 60s
  },
});

/**
 *
 * @param {*} gameName
 */
async function createGame(gameName) {
  console.log(`⚙️ createGame: ${gameName}`);
  const gameId = slugString(gameName); // REVIEW this with @mmbotelho
  // Verify if game exists...
  const gameRef = DB.ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (game.exists()) {
    throw new Error('exists');
  }

  // Verify if we can create the game...
  const id = LOCAL_PROFILE.id;
  if (!id) {
    throw new Error('notSigned');
  }

  // Create the game!
  await DB.ref(`games/${gameId}`).set(
    gameInitialState({
      id: gameId,
      name: gameName,
      creatorId: LOCAL_PROFILE.id,
    })
  );

  // Prevent duplicate subs
  PubSub.unsubscribe('game');
  await _unsubGame(gameId);

  setTimeout(() => {
    _pubGame(gameId);
  }, 0);

  return gameId;
}

/**
 *
 */
async function joinGame(gameName) {
  console.log(`⚙️ joinGame: ${gameName}`);
  const gameId = slugString(gameName); // REVIEW this with @mmbotelho
  // Verify if game exists...
  const gameRef = DB.ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (!game.exists()) {
    throw new Error('notFound');
  }

  // Verify if we can access the game...
  const id = LOCAL_PROFILE.id;
  if (!id) {
    throw new Error('notSigned');
  }

  const alreadyStarted = game.child('alreadyStarted').val();

  const gamePlayers = game.child('players');
  const ImInTheGame = gamePlayers.child(id).val();

  if (alreadyStarted && !ImInTheGame) {
    // After the game starts, new players cannot join unless
    // they are already part of the game (were isAfk)
    throw new Error('alreadyStarted');
  }

  await DB.ref(`games/${gameId}/players/${id}`).set({
    isAfk: false,
  });

  // Prevent duplicate subs
  PubSub.unsubscribe('game');
  await _unsubGame(gameId);

  setTimeout(() => {
    _pubGame(gameId);
  }, 0);

  return gameId;
}

/**
 *
 * @param {String} gameId
 */
function _pubGame(gameId) {
  LOCAL_PROFILE.gameId = gameId;
  console.log('⚙️ _pubGame', gameId);

  // Subscribe to initial game set!
  DB.ref(`games/${gameId}`).once('value', async function (data) {
    const game = data.val();

    // Retrieve game players' profiles!
    const profiles = {};
    for (const playerId in game.players) {
      if (playerId === LOCAL_PROFILE.id) {
        profiles[playerId] = {
          name: LOCAL_PROFILE.name,
          avatar: LOCAL_PROFILE.avatar,
        };
      } else {
        const profile = await DB.ref(`users/${playerId}`).once('value');
        profiles[playerId] = profile.val();
      }
    }

    // Set the initial state of the game.
    console.log('⚙️ pub.game.set');
    PubSub.publish('game.set', { game, profiles });

    const DB_PLAYERS = DB.ref(`games/${gameId}/players`);

    // Sub to players status
    DB_PLAYERS.on('child_added', async function (data) {
      const id = data.key;
      const val = data.val();
      const profile = await DB.ref(`users/${id}`).once('value');

      // https://stackoverflow.com/questions/18270995/how-to-retrieve-only-new-data
      // OPTMIZE - Throttle this and send only 1 big publish.
      PubSub.publish('game.players.added', {
        id,
        info: val,
        profile: profile.val(),
      });

      DB.ref(`users/${id}/isAfk`).on('value', data => {
        console.log('⚙️ player is afk!', id, data.val());
        PubSub.publish('game.players.changed', {
          id,
          info: {
            isAfk: data.val(),
          },
        });
      });
    });
    DB_PLAYERS.on('child_removed', function (data) {
      const id = data.key;

      DB.ref(`users/${id}/isAfk`).off('value');

      PubSub.publish('game.players.removed', {
        id,
        newAdmin: null, // TODO
      });
    });
    DB_PLAYERS.on('child_changed', function (data) {
      const id = data.key;
      PubSub.publish('game.players.changed', {
        id,
        info: data.val()[id],
      });
    });

    // Sub to teams status
    DB.ref(`games/${gameId}/teams`).on('value', async function (data) {
      const teams = data.val();
      PubSub.publish('game.teams.set', teams);
    });

    // Sub to words added
    DB.ref(`games/${gameId}/words`).on('child_added', async function (data) {
      PubSub.publish('game.words.set', {
        pId: data.key,
        words: data.val(),
      });
    });

    DB.ref(`games/${gameId}/words`).on('child_changed', async function (data) {
      PubSub.publish('game.words.set', {
        pId: data.key,
        words: data.val(),
      });
    });

    // Sub to game starting
    DB.ref(`games/${gameId}/hasStarted`).on('value', async function (data) {
      PubSub.publish('game.hasStarted', data.val());
    });

    // Sub to round status - OPTIMIZE?
    DB.ref(`games/${gameId}/round`).on('value', async function (data) {
      PubSub.publish('game.round', data.val());
    });

    // Sub to round status - OPTIMIZE?
    DB.ref(`games/${gameId}/score`).on('value', async function (data) {
      PubSub.publish('game.score', data.val());
    });
  });

  // Prepare in case we get offline.
  const isAfkRef = firebase.database().ref(`users/${LOCAL_PROFILE.id}/isAfk`);
  isAfkRef.onDisconnect().set(true); // TODO subscribe
}

/**
 *
 */
async function leaveGame() {
  console.log('⚙️ leaveGame()', LOCAL_PROFILE.id);
  const gameId = LOCAL_PROFILE.gameId;

  if (!gameId) {
    throw new Error('gameIdMissing');
  }

  const gameRef = DB.ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (!game.exists()) {
    throw new Error('notFound');
  }

  // If is last player, remove game.
  if (Object.keys(game.val().players).length === 1) {
    console.log(':: last player - remove game');
    await DB.ref(`games/${gameId}`).remove();
  } else {
    console.log(':: remove player');
    await DB.ref(`games/${gameId}/players/${LOCAL_PROFILE.id}`).remove();
  }

  PubSub.publish('game.leave');

  await _unsubGame(gameId);

  setTimeout(() => {
    console.log('⚙️ Unsubscribe game');
    PubSub.unsubscribe('game');
  }, 0);
}

async function _unsubGame(gameId) {
  console.log('⚙️ _unsubGame()', gameId);

  // Disconnect from group
  const DB_PLAYERS = DB.ref(`games/${gameId}/players`);

  DB_PLAYERS.off('child_added');
  DB_PLAYERS.off('child_removed');
  DB_PLAYERS.off('child_changed');

  DB.ref(`games/${gameId}/teams`).off('value');

  DB.ref(`games/${gameId}/words`).off('child_added');
  DB.ref(`games/${gameId}/words`).off('child_changed');

  DB.ref(`games/${gameId}/hasStarted`).off('value');
  DB.ref(`games/${gameId}/round`).off('value');
  DB.ref(`games/${gameId}/score`).off('value');

  const players = await DB.ref(`games/${gameId}/players`).once('value');

  for (const playerId in players.val()) {
    DB.ref(`users/${playerId}/isAfk`).off('value');
  }
}

/**
 *
 */
async function removePlayer(playerId) {
  const gameId = LOCAL_PROFILE.gameId;
  console.log('⚙️ removePlayer()', gameId, playerId);

  if (!gameId) {
    throw new Error('gameIdMissing');
  }

  const gameRef = DB.ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (!game.exists()) {
    throw new Error('notFound');
  }

  console.log(':: removing player');
  await DB.ref(`games/${gameId}/players/${playerId}`).remove();
}
/**
 *
 */
async function setTeams(teams) {
  console.log('⚙️ setTeams()');
  const gameId = LOCAL_PROFILE.gameId;

  await DB.ref(`games/${gameId}/teams`).set(teams);
}

/**
 *
 */
async function setWords(words) {
  console.log('⚙️ setWords()');
  const gameId = LOCAL_PROFILE.gameId;
  const playerId = LOCAL_PROFILE.id;

  // - 16:05 BUG - Can't replicate this error! 🐛👀
  // [Unhandled promise rejection: Error: Reference.set failed: First argument contains a function in property 'games.ggg.words.dHwRWKyBdlSNGvKczyyI9coIoRD2.0._targetInst.stateNode._children.0.viewConfig.validAttributes.style.shadowColor.process' with contents = function processColor(color) {]
  await DB.ref(`games/${gameId}/words/${playerId}`).set(words);
}

/**
 * a shortcut for dev only.
 */
async function setWordsForEveryone(allWords) {
  console.log('⚙️ setWordsForEveyone()');
  const gameId = LOCAL_PROFILE.gameId;

  await DB.ref(`games/${gameId}/words`).set(allWords);
}

/**
 *
 */
function _allWordsTogether(words) {
  return Object.keys(words).reduce((acc, pId) => [...acc, ...words[pId]], []);
}

/**
 *
 */
async function startGame(words) {
  console.log('⚙️ startGame()');
  const gameId = LOCAL_PROFILE.gameId;

  await DB.ref(`games/${gameId}/round`).set({
    current: 0,
    turnWho: { 0: 0, 1: 0, 2: false },
    turnCount: 0,
    status: 'getReady',
    wordsLeft: _allWordsTogether(words),
  });
  await DB.ref(`games/${gameId}/hasStarted`).set(true);
}

/**
 *
 */
async function startTurn(words) {
  console.log('⚙️ startTurn()');
  const gameId = LOCAL_PROFILE.gameId;

  // The client is responsible for the countdown and then
  // it sends 'finishTurn()' with score. It saves on IO events for each second.
  await DB.ref(`games/${gameId}/round/status`).set(Date.now());
}

function _getNextTurn({ turnWho, teams }) {
  const [teamIndex, playerIndex] = turnWho;
  const totalTeams = Object.keys(teams).length;

  // BUG / TODO - Handle correctly when teams are not even! [1]
  if (teamIndex < totalTeams - 1) {
    const nextTeamIndex = teamIndex + 1;
    const totalTeamPlayers = teams[nextTeamIndex].players.length;

    if (playerIndex < totalTeamPlayers) {
      return { 0: nextTeamIndex, 1: playerIndex, 2: false };
    } else {
      return { 0: nextTeamIndex, 1: playerIndex, 2: true }; // [1]
    }
  } else {
    const totalTeamPlayers = teams[0].players.length;
    const nextPlayer = playerIndex + 1;

    if (nextPlayer < totalTeamPlayers) {
      return { 0: 0, 1: nextPlayer, 2: false };
    } else {
      return { 0: 0, 1: 0, 2: false };
    }
  }

  // if (player < totalPlayers) {
  //   return [team, player + 1];
  // } else {
  //   if (team < totalTeams) {
  //     return [team + 1, 0];
  //   } else {
  //     return [0, 0];
  //   }
  // }
}

/**
 *
 * @param {Object} papersTurn - papers involved in this turn.
 * @param {String} papersTurn.current - current paper on the screen
 * @param {[String]} papersTurn.passed - papers passed
 * @param {[String]} papersTurn.guessed - papers guessed
 * @param {[String]} papersTurn.wordsLeft - papers left
 */
async function finishTurn({ playerScore, roundStatus }) {
  console.log('⚙️ finishTurn()');
  const gameId = LOCAL_PROFILE.gameId;

  await DB.ref(`games/${gameId}/score/${roundStatus.current}`).update(playerScore);
  await DB.ref(`games/${gameId}/round`).update(roundStatus);
}

/**
 *
 * @param {Object} round - game round status
 * @param {Object} teams - game teams
 * @param {Object} words - game words by player
 */
async function startNextRound({ round, teams, words }) {
  console.log('⚙️ startNextRound()');
  const gameId = LOCAL_PROFILE.gameId;

  // TODO - Do validations - if wordsLeft is 0, if round is last, etc...
  const newRound = {
    current: round.current + 1,
    turnWho: _getNextTurn({ turnWho: round.turnWho, teams }),
    turnCount: 0,
    status: 'getReady',
    wordsLeft: _allWordsTogether(words),
  };

  await DB.ref(`games/${gameId}/round`).update(newRound);
}
