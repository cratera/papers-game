import * as firebase from 'firebase';
import PubSub from 'pubsub-js';

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

export default function init(done) {
  console.log('FB_ init()');

  if (firebase.apps.length > 0) {
    console.warn('Already initialized!');
    PubSub.publish('signed', LOCAL_PROFILE.uid);
  } else {
    firebase.initializeApp(firebaseConfig);

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        LOCAL_PROFILE.uid = user.uid;
        PubSub.publish('signed', LOCAL_PROFILE.uid);
      } else {
        // User is signed out.
        // ...
      }
    });
  }

  return {
    on,
    signIn,
    updateProfile, // setUser?
    resetProfile,
    getUser,
    joinGame,
    createGame,
  };
}

function on(topic, cb) {
  /** Topics Available:
    - signed: user signed (auth) successfully
      - uid: String - userid
  */
  PubSub.subscribe(topic, cb);
}
function signIn({ id, name, avatar, gameId }, cb) {
  const uid = LOCAL_PROFILE.uid;
  LOCAL_PROFILE = { uid, id, name, avatar, gameId };

  firebase
    .auth()
    .signInAnonymously()
    .catch(function(error) {
      console.error('signInAnonymously error:', error);
      cb(null, error);
    });
}
function updateProfile({ id, name, avatar, gameId }) {
  console.log('FB_ updateProfile()', LOCAL_PROFILE.uid, id, name, gameId);
  firebase
    .database()
    .ref('users/' + LOCAL_PROFILE.uid)
    .set({
      id,
      name,
      avatar,
      gameId,
      // email: email,
    });
}
function resetProfile(uid) {
  updateProfile({
    id: null,
    name: null,
    avatar: null,
    gameId: null,
  });
}
function getUser(userId) {
  console.log('FB_ getUser()', LOCAL_PROFILE.uid, id, name, gameId);

  // var userId = firebase.auth().currentUser.uid;
  // return firebase
  //   .database()
  //   .ref('/users/' + userId)
  //   .once('value')
  //   .then(function(snapshot) {
  //     console.log('GET USER!', snapshot.val());
  //   });
}
function joinGame(gameId, cb) {
  console.log(`TODO join game ${gameId}`);
  cb(null, new Error(`TODO join game ${gameId}`));
}
function createGame(gameId, cb) {
  console.log(`TODO create game ${gameId}`);
  cb(null, new Error(`TODO create game ${gameId}`));
}
