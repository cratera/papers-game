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

let LOCAL_PROFILE = {};

const PUBLIC_API = {
  on,
  signIn,
  updateProfile, // setUser?
  resetProfile,
  getUser,
  createGame,
  joinGame,
};

export function serverReconnect({ id, name, gameId }) {
  if (firebase.apps.length > 0) {
    // Let's REVIEW this odd scenario later...
    console.log('FB_ serverReconnect(), reconnected!');
    return { socket: PUBLIC_API };
  }

  console.log('FB_ serverReconnect(), dont exist!', LOCAL_PROFILE.id, id);

  if (gameId) {
    console.log('TODO Look fo gameId and rejoin!', gameId);
  }

  return {};
}

export default function init(options, done) {
  console.log('FB_ init()');

  if (firebase.apps.length > 0) {
    console.warn('Already initialized!');
  } else {
    firebase.initializeApp(firebaseConfig);
  }

  subscribeToAuthState();

  return PUBLIC_API;
}

function subscribeToAuthState() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      LOCAL_PROFILE.id = user.uid;
      console.log('FB_ Signed!', LOCAL_PROFILE.id);
      updateProfile(LOCAL_PROFILE);
      PubSub.publish('signed', LOCAL_PROFILE.id);
    } else {
      // User is signed out.
      // ...
    }
  });
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

/**
 * Do Auth. Needed before accessing to a game
 */
function signIn({ name, avatar }, cb) {
  const id = LOCAL_PROFILE.id;
  LOCAL_PROFILE = { id, name, avatar };

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
  console.log('FB_ updateProfile()', LOCAL_PROFILE.id, LOCAL_PROFILE.name);
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
  console.log('FB_ getUser()', LOCAL_PROFILE.id, userId);

  // var userId = firebase.auth().currentUser.uid;
  // return firebase
  //   .database()
  //   .ref('/users/' + userId)
  //   .once('value')
  //   .then(function(snapshot) {
  //     console.log('GET USER!', snapshot.val());
  //   });
}

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

async function createGame(gameName, cb) {
  if (!LOCAL_PROFILE.id) {
    cb(null, new Error('ProfileDoesntExit'));
    return;
  }

  const gameId = slugString(gameName); // REVIEW this with @mmbotelho

  // Verify if game exists...
  const gameRef = firebase.database().ref(`games/${gameId}`);
  const snapshot1 = await gameRef.once('value');

  if (snapshot1.exists()) {
    cb(null, new Error('exists'));
    return;
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
  // Wait for game to be setted!
  await gameRef.once('value');
  cb(initialState, null);
}

/**
 * Join an existing game
 */
function joinGame(gameName, cb) {
  console.log(`TODO join game ${gameName}`);

  cb(null, new Error(`TODO join game ${gameName}`));
}
