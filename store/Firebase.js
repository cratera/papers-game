import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/auth'
import 'firebase/storage'

import PubSub from 'pubsub-js'
import { slugString } from '@constants/utils.js'

// Fixing a bug with firebase file upload put() _uploadAvatar()
// https://forums.expo.io/t/imagepicker-base64-to-firebase-storage-problem/1415/11
// import Base64 from 'base-64';
// global.atob = Base64.encode;

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
}

let LOCAL_PROFILE = {} // not sure if this is good.
let DB // firebase database

const PUBLIC_API = {
  on,
  offAll,
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

  markMeAsReady,
  markMeAsReadyForNextRound,

  startTurn,
  setPapersGuessed,
  finishTurn,
  setRound,
}

// export function serverReconnect({ id, name, gameId }) {
//   if (firebase.apps.length > 0) {
//     // Let's REVIEW this odd scenario later...
//     console.log('⚙️ serverReconnect(), already connected!')
//     return { socket: PUBLIC_API }
//   }

//   console.log('⚙️ serverReconnect() - doesnt exist!', LOCAL_PROFILE.id, id)

//   const API = init()

//   return API
// }

export default function init(options) {
  console.log('⚙️ init()')

  if (firebase.apps.length > 0) {
    console.warn('Already initialized!')
  } else {
    firebase.initializeApp(firebaseConfig)
  }

  DB = firebase.database()

  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      LOCAL_PROFILE.id = user.uid
      LOCAL_PROFILE.isAfk = false
      console.log('⚙️ Signed!', LOCAL_PROFILE.id)

      await updateProfile(LOCAL_PROFILE)
      PubSub.publish('profile.signed', LOCAL_PROFILE.id)
    } else {
      // User is signed out.
      // ...
    }
  })

  return PUBLIC_API
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
  console.log('⚙️ on()', topic)
  PubSub.subscribe(topic, cb)
}

async function offAll() {
  const gameId = LOCAL_PROFILE.gameId
  console.log('⚙️ offAll(), Firebase disconnecting!', gameId)
  PubSub.clearAllSubscriptions()
  _unsubGame(gameId)
}

// ============== AUTH / PROFILE

/**
 * Do Auth. Needed before accessing to a game
 */
function signIn({ name, avatar }, cb) {
  LOCAL_PROFILE = { name, avatar }

  firebase
    .auth()
    .signInAnonymously()
    .catch(function (error) {
      console.error('signInAnonymously error:', error)
      cb(null, error)
    })
}

async function _uploadAvatar({ path, fileName, avatar }) {
  console.log(':: _uploadAvatar', path, fileName)

  // const base64Match = avatar.match(/image\/(jpeg|jpg|gif|png)/);
  // const imgMatched = avatar.match(/\.(jpeg|jpg|gif|png)/);
  // let format;
  // if (base64Match) {
  //   format = base64Match && base64Match[1]; // ex: look for "image/png"
  // } else {
  //   format = imgMatched && imgMatched[1];
  // }
  // const metadata = { contentType: `image/${format}` };

  // Option 3:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  // https://github.com/aaronksaunders/expo-rn-firebase-image-upload/blob/master/README.md
  // 🐛 Still not working properly: https://github.com/facebook/react-native/issues/22681
  // It seems it failes "Network request failed" when the image is too big. Hum...
  const response = await fetch(avatar)
  const blob = await response.blob()
  const ref = await firebase.storage().ref(path).child(fileName)
  const task = ref.put(blob) //, metadata);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snapshot => {},
      error => reject(error),
      () => {
        const downloadURL = task.snapshot.ref.getDownloadURL()
        resolve(downloadURL)
      }
    )
  })
}

/**
 * Update profile
 * @param {Object} profile - The params to update the profile
 * @param {Object} profile.id - The profile id
 * @param {Object} profile.name - The profile name
 * @param {Object} profile.avatar - The params avatar - base64
 * @param {Object} profile.gameId - The last gameid they tried to access
 */
async function updateProfile(profile) {
  console.log('⚙️ updateProfile()', profile)
  const { avatar, ...theProfile } = profile

  try {
    const isHTTPLink = avatar && avatar.indexOf('https://') === 0
    if (avatar && isHTTPLink) {
      console.log(':: avatar ignored because it is a link')
    }
    if (avatar && !isHTTPLink) {
      try {
        const downloadURL = await _uploadAvatar({
          path: `users/${LOCAL_PROFILE.id}/`,
          fileName: 'avatar',
          avatar,
        })
        theProfile.avatar = downloadURL
        LOCAL_PROFILE.avatar = downloadURL
        console.log(':: avatar uploaded!', downloadURL)
        PubSub.publish('profile.avatarSet', downloadURL)
      } catch (error) {
        console.warn(':: avatar upload failed!', error)
        theProfile.avatar = null // delete. Maybe save base64 as fallback?
      }
    }
    if (avatar === null) {
      theProfile.avatar = null // so avatar can be deleted from DB
      // TODO - delete avatar from storage.
    }
    DB.ref('users/' + LOCAL_PROFILE.id).update(theProfile)
  } catch (error) {
    console.warn('⚙️ updateProfile failed!', error)
  }

  return theProfile
}

/**
 * Reset profile - delete the profile from the DB.
 */
function resetProfile(id) {
  updateProfile({
    id: null,
    name: null,
    avatar: null, // TODO - delete avatar from storage
    gameId: null,
  })
}

/**
 *
 */
function getUser(userId) {
  console.log('⚙️ getUser()', LOCAL_PROFILE.id, userId)

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
  papersGuessed: 0, // Number - updated as the player guesses words.
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
    time_ms: 60000, // 60s
  },
})

/**
 *
 * @param {*} gameName
 */
async function createGame(gameName) {
  console.log(`⚙️ createGame: ${gameName}`, { LOCAL_PROFILE })
  const gameId = slugString(gameName) // REVIEW this with @mmbotelho
  // Verify if game exists...
  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (game.exists()) {
    throw new Error('exists')
  }

  // Verify if we can create the game...
  const id = LOCAL_PROFILE.id
  if (!id) {
    throw new Error('notSigned')
  }

  // Create the game!
  await DB.ref(`games/${gameId}`).set(
    gameInitialState({
      id: gameId,
      name: gameName,
      creatorId: LOCAL_PROFILE.id,
    })
  )

  // Prevent duplicate subs
  PubSub.unsubscribe('game')
  await _unsubGame(gameId)

  setTimeout(() => {
    _pubGame(gameId)
  }, 0)

  return gameId
}

/**
 *
 */
async function joinGame(gameName) {
  console.log(`⚙️ joinGame: ${gameName}`)
  const gameId = slugString(gameName) // REVIEW this with @mmbotelho
  // Verify if game exists...
  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (!game.exists()) {
    throw new Error('notFound')
  }

  // Verify if we can access the game...
  const id = LOCAL_PROFILE.id
  if (!id) {
    throw new Error('notSigned')
  }

  const alreadyStarted = game.child('alreadyStarted').val()

  const gamePlayers = game.child('players')
  const ImInTheGame = gamePlayers.child(id).val()

  if (alreadyStarted && !ImInTheGame) {
    // After the game starts, new players cannot join unless
    // they are already part of the game (were isAfk)
    throw new Error('alreadyStarted')
  }

  await DB.ref(`games/${gameId}/players/${id}`).update({
    isAfk: false,
  })

  // Prevent duplicate subs
  PubSub.unsubscribe('game')
  await _unsubGame(gameId)

  setTimeout(() => {
    _pubGame(gameId)
  }, 0)

  return gameId
}

/**
 *
 * @param {String} gameId
 */
function _pubGame(gameId) {
  LOCAL_PROFILE.gameId = gameId
  console.log('⚙️ _pubGame', gameId)

  // Subscribe to initial game set!
  DB.ref(`games/${gameId}`).once('value', async function (data) {
    const game = data.val()

    // Retrieve game players' profiles!
    const profiles = {}
    for (const playerId in game.players) {
      if (playerId === LOCAL_PROFILE.id) {
        profiles[playerId] = {
          name: LOCAL_PROFILE.name,
          avatar: LOCAL_PROFILE.avatar,
        }
      } else {
        const profile = await DB.ref(`users/${playerId}`).once('value')
        profiles[playerId] = profile.val()
      }
    }

    // Set the initial state of the game.
    console.log('⚙️ pub.game.set')
    PubSub.publish('game.set', { game, profiles })

    const DB_PLAYERS = DB.ref(`games/${gameId}/players`)

    // Sub to players status
    DB_PLAYERS.on('child_added', async function (data) {
      const id = data.key
      const val = data.val()
      const profile = await DB.ref(`users/${id}`).once('value')

      // https://stackoverflow.com/questions/18270995/how-to-retrieve-only-new-data
      // OPTMIZE - Throttle this and send only 1 big publish.
      PubSub.publish('game.players.added', {
        id,
        info: val,
        profile: profile.val(),
      })

      DB.ref(`users/${id}/isAfk`).on('value', data => {
        console.log('⚙️ player is afk!', id, data.val())
        PubSub.publish('game.players.changed', {
          id,
          info: {
            isAfk: data.val(),
          },
        })
      })
    })
    DB_PLAYERS.on('child_removed', function (data) {
      const id = data.key

      DB.ref(`users/${id}/isAfk`).off('value')

      PubSub.publish('game.players.removed', {
        id,
        newAdmin: null, // TODO
      })
    })
    DB_PLAYERS.on('child_changed', function (data) {
      const id = data.key
      PubSub.publish('game.players.changed', {
        id,
        info: data.val(),
      })
    })

    // Sub to teams status
    DB.ref(`games/${gameId}/teams`).on('value', async function (data) {
      const teams = data.val()
      PubSub.publish('game.teams.set', teams)
    })

    // Sub to words added
    DB.ref(`games/${gameId}/words`).on('child_added', async function (data) {
      PubSub.publish('game.words.set', {
        pId: data.key,
        words: data.val(),
      })
    })

    DB.ref(`games/${gameId}/words`).on('child_changed', async function (data) {
      PubSub.publish('game.words.set', {
        pId: data.key,
        words: data.val(),
      })
    })

    // Sub to game starting
    DB.ref(`games/${gameId}/hasStarted`).on('value', async function (data) {
      PubSub.publish('game.hasStarted', data.val())
    })

    // Sub to round status - OPTIMIZE?
    DB.ref(`games/${gameId}/round`).on('value', async function (data) {
      PubSub.publish('game.round', data.val())
    })

    // Sub to round status - OPTIMIZE?
    DB.ref(`games/${gameId}/score`).on('value', async function (data) {
      PubSub.publish('game.score', data.val())
    })

    DB.ref(`games/${gameId}/papersGuessed`).on('value', async function (data) {
      PubSub.publish('game.papersGuessed', data.val())
    })
  })

  // Prepare in case we get offline.
  const isAfkRef = firebase.database().ref(`users/${LOCAL_PROFILE.id}/isAfk`)
  isAfkRef.onDisconnect().set(true) // TODO subscribe
  // TODO/BUG isAFK sometimes is a negative positive. dunno why
}

/**
 *
 */
async function leaveGame({ wasKicked = false } = {}) {
  console.log('⚙️ leaveGame()', { wasKicked }, LOCAL_PROFILE.id)
  const gameId = LOCAL_PROFILE.gameId

  if (!gameId) {
    throw new Error('gameIdMissing')
  }

  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (!game.exists()) {
    throw new Error('notFound')
  }

  await DB.ref(`games/${gameId}/players/${LOCAL_PROFILE.id}`).remove()

  PubSub.publish('game.leave')

  await _unsubGame(gameId)

  setTimeout(() => {
    console.log('⚙️ Unsubscribe game')
    PubSub.unsubscribe('game')

    // A kickedout player cannot remove the game.
    // It means there's still someone left.
    if (!wasKicked && Object.keys(game.val().players).length === 1) {
      console.log(':: last player - remove game')
      DB.ref(`games/${gameId}`).remove()
    }
  }, 0) // Q: Why did I use timeout here?
}

async function _unsubGame(gameId) {
  console.log('⚙️ _unsubGame()', gameId)

  // Disconnect from group
  const DB_PLAYERS = DB.ref(`games/${gameId}/players`)

  DB_PLAYERS.off('child_added')
  DB_PLAYERS.off('child_removed')
  DB_PLAYERS.off('child_changed')

  DB.ref(`games/${gameId}/teams`).off('value')

  DB.ref(`games/${gameId}/words`).off('child_added')
  DB.ref(`games/${gameId}/words`).off('child_changed')

  DB.ref(`games/${gameId}/hasStarted`).off('value')
  DB.ref(`games/${gameId}/round`).off('value')
  DB.ref(`games/${gameId}/score`).off('value')

  const players = await DB.ref(`games/${gameId}/players`).once('value')

  for (const playerId in players.val()) {
    DB.ref(`users/${playerId}/isAfk`).off('value')
  }
}

/**
 *
 */
async function removePlayer(playerId) {
  const gameId = LOCAL_PROFILE.gameId
  console.log('⚙️ removePlayer()', gameId, playerId)

  if (!gameId) {
    throw new Error('gameIdMissing')
  }

  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (!game.exists()) {
    throw new Error('notFound')
  }

  console.log(':: removing player')
  await DB.ref(`games/${gameId}/players/${playerId}`).remove()
}
/**
 *
 */
async function setTeams(teams) {
  console.log('⚙️ setTeams()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/teams`).set(teams)
}

/**
 *
 */
async function setWords(words) {
  console.log('⚙️ setWords()', words)
  const gameId = LOCAL_PROFILE.gameId
  const playerId = LOCAL_PROFILE.id

  /*
  To save memory in DB let's store the words as key:value. The simple key
  is the word index in the array of all words. The final output will be
  something like: (example has 3 words per player:)
  words: {
    _all: ['run', 'portugal', 'development', 'card', 'sea', 'cold'],
    playerId1: [0, 1, 2], // run, portugal, development
    playerId2: [3, 4, 5], // card, sea, cold.
  }
  */

  const wordsOnce = await DB.ref(`games/${gameId}/words/_all`).once('value')
  const wordsStored = wordsOnce.val() || []
  const wordsCount = wordsStored.length
  const wordsAsKeys = words.map((w, index) => index + wordsCount)

  // - 16:05 BUG - Can't replicate this error! 🐛👀
  // [Unhandled promise rejection: Error: Reference.set failed: First argument contains a function in property 'games.ggg.words.dHwRWKyBdlSNGvKczyyI9coIoRD2.0._targetInst.stateNode._children.0.viewConfig.validAttributes.style.shadowColor.process' with contents = function processColor(color) {]
  await DB.ref(`games/${gameId}/words/_all`).set([...wordsStored, ...words])
  await DB.ref(`games/${gameId}/words/${playerId}`).set(wordsAsKeys)
}

/**
 * a shortcut for dev only.
 */
async function setWordsForEveryone(allWords) {
  console.log('⚙️ setWordsForEveyone()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/words`).set(allWords)
}

/**
 *
 */
async function markMeAsReady(roundStatus) {
  console.log('⚙️ markMeAsReady()')
  const { gameId, id } = LOCAL_PROFILE

  // REVIEW/TODO: Maybe round update should be done before, once all words are submitted.
  await DB.ref(`games/${gameId}/round`).set(roundStatus)

  await DB.ref(`games/${gameId}/players/${id}`).update({ isReady: true })

  // REVIEW: Is this the right place?
  // It's a side effect, I never know what's the best place for it.
  const playersRef = await DB.ref(`games/${gameId}/players`).once('value')
  const players = playersRef.val()
  const isEveryoneReady = Object.keys(players).every(pId => players[pId].isReady)

  if (isEveryoneReady) {
    console.log(':: everyones ready. Start Game!')
    await DB.ref(`games/${gameId}/hasStarted`).set(true)
  }
}

async function markMeAsReadyForNextRound(everyonesReadyCb) {
  console.log('⚙️ markMeAsReadyForNextRound()')
  const { gameId, id } = LOCAL_PROFILE

  await DB.ref(`games/${gameId}/players/${id}`).update({ isReady: true })

  // REVIEW: Is this the right place?
  // It's a side effect, I never know what's the best place for it.
  const playersRef = await DB.ref(`games/${gameId}/players`).once('value')
  const players = playersRef.val()
  const isEveryoneReady = Object.keys(players).every(pId => players[pId].isReady)

  if (isEveryoneReady) {
    console.log(':: everyones ready. Start next round!')
    // REVIEW: Should this be responsability of context or firebase?
    everyonesReadyCb()
  }
}

/**
 *
 */
async function startTurn(words) {
  console.log('⚙️ startTurn()')
  const gameId = LOCAL_PROFILE.gameId

  // The client is responsible for the countdown and then
  // it sends 'finishTurn()' with score. It saves on IO events for each second.
  await DB.ref(`games/${gameId}/round/status`).set(Date.now())
}

function setPapersGuessed(count) {
  console.log('⚙️ setPapersGuessed()', count)
  const gameId = LOCAL_PROFILE.gameId

  DB.ref(`games/${gameId}/papersGuessed`).set(count)
}

/**
 *
 */
async function finishTurn({ playerScore, roundStatus }, cb) {
  console.log('⚙️ finishTurn()')
  const gameId = LOCAL_PROFILE.gameId

  try {
    if (roundStatus.status === 'finished') {
      // Mark players as not ready for the next round.
      // Do this before, so that RoundScore UI shows correctly
      const playersRef = await DB.ref(`games/${gameId}/players`).once('value')
      const players = playersRef.val()

      for (const pId in players) {
        players[pId].isReady = false
      }

      await DB.ref(`games/${gameId}/players/`).set(players)
    }

    await DB.ref(`games/${gameId}/score/${roundStatus.current}`).update(playerScore)
    await DB.ref(`games/${gameId}/round`).update(roundStatus)
    await DB.ref(`games/${gameId}/papersGuessed`).set(0)
  } catch (e) {
    cb(e)
  }
}

/**
 *
 */
async function setRound(roundStatus) {
  console.log('⚙️ startNextRound()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/round`).set(roundStatus)
}
