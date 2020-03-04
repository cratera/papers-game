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

const PUBLIC_API = {
  on,
  signIn,
  updateProfile, // setUser?
  resetProfile,
  getUser,
  createGame,
  joinGame,
  leaveGame,
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
    return PUBLIC_API;
  }

  firebase.initializeApp(firebaseConfig);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      LOCAL_PROFILE.id = user.uid;
      console.log('⚙️ Signed!', LOCAL_PROFILE.id);

      updateProfile(LOCAL_PROFILE);
      PubSub.publish('signed', LOCAL_PROFILE.id);
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
    .catch(function(error) {
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
  firebase
    .database()
    .ref('users/' + LOCAL_PROFILE.id)
    .update(profile);
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
 * TBD
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
  players: {
    [creatorId]: {
      type: 'creator', // 'admin' | 'user'
      afk: false, // Bool
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
    turnWho: null, // [Number, Number] - [teamIndex, playerIndex]
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

async function createGame(gameName) {
  console.log(`⚙️ createGame: ${gameName}`);

  const gameId = slugString(gameName); // REVIEW this with @mmbotelho

  // Verify if game exists...
  const gameRef = firebase.database().ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (game.exists()) {
    throw new Error('exists');
  }

  // Create the game!
  const initialState = gameInitialState({
    id: gameId,
    name: gameName,
    creatorId: LOCAL_PROFILE.id,
  });

  firebase
    .database()
    .ref(`games/${gameId}`)
    .set(initialState);

  setTimeout(() => {
    _pubGame(gameId);
  }, 0);

  return gameId;
}

async function joinGame(gameName) {
  console.log(`⚙️ joinGame: ${gameName}`);

  const gameId = slugString(gameName); // REVIEW this with @mmbotelho

  // Verify if game exists...
  const gameRef = firebase.database().ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (!game.exists()) {
    throw new Error('notFound');
  }

  // Verify if we can access the game...
  const id = LOCAL_PROFILE.id;
  const alreadyStarted = game.child('alreadyStarted').val();

  const gamePlayers = game.child('players');
  const ImInTheGame = gamePlayers.child(id).val();

  if (alreadyStarted && !ImInTheGame) {
    // After the game starts, new players cannot join unless
    // they are already part of the game (were afk)
    throw new Error('alreadyStarted');
  }

  firebase
    .database()
    .ref(`games/${gameId}/players`)
    .update({
      [LOCAL_PROFILE.ui]: { type: 'user' },
    });

  setTimeout(() => {
    _pubGame(gameId);
  }, 0);

  return gameId;
}

function _pubGame(gameId) {
  console.log('⚙️ _pubGame', gameId);
  LOCAL_PROFILE.gameId = gameId;

  // Subscribe to game!
  firebase
    .database()
    .ref(`games/${LOCAL_PROFILE.gameId}`)
    .once('value', function(data) {
      PubSub.publish('set-game', data);
    });

  // Prepare in case we get offline.
  const afkRef = firebase
    .database()
    .ref(`games/${LOCAL_PROFILE.gameId}/players/${LOCAL_PROFILE.id}/afk`);
  afkRef.onDisconnect().set(true);
}

async function leaveGame() {
  console.log('⚙️ leaveGame()');
  // Verify if game exists...
  const gameId = LOCAL_PROFILE.gameId;

  if (!gameId) {
    throw new Error('gameIdMissing');
  }
  const gameRef = firebase.database().ref(`games/${gameId}`);
  const game = await gameRef.once('value');

  if (!game.exists()) {
    throw new Error('notFound');
  }

  await firebase
    .database()
    .ref(`games/${gameId}/players`)
    .update({
      [LOCAL_PROFILE.ui]: {},
    });

  PubSub.publish('leave-game');

  setTimeout(() => {
    console.log('⚙️ Unsubscribe game');
    PubSub.unsubscribe('set-game');
    PubSub.unsubscribe('leave-game');
  }, 0);

  // Disconnect from group
  // firebase.database().ref(`games/${gameId}`).off('value');
  // firebase.database().ref(`games/${gameId}`).off('value');
}
