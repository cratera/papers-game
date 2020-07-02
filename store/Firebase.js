// TODO/REVIEW: I assume this entire file would be a set of "Cloud Functions".

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

import PubSub from 'pubsub-js'
import * as Analytics from 'expo-firebase-analytics'

import { slugString } from '@constants/utils.js'

// Fixing a bug with firebase file upload put() _uploadAvatar()
// https://forums.expo.io/t/imagepicker-base64-to-firebase-storage-problem/1415/11
// import Base64 from 'base-64';
// global.atob = Base64.encode;

const firebaseConfig = {
  // https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public
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

  logEvent,
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
    console.log('Already initialized!')
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
      console.warn('signInAnonymously error:', error)
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

const gameInitialState = ({ id, name, code, creatorId }) => ({
  id, // gameSlugged_code
  name,
  code,
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
    // // Empty by default so that markMeAsReady works properly
    // current: null, // Number - Round index
    // turnWho: null, // {team: teamId, ...teamId: [playerIndex] }
    // /* ex: team 1, player 2 is playing.
    // turnWho: {
    //   team: 1,
    //   0: 3,
    //   1: 2
    // }
    // */
    // turnCount: 0, // Number - Turn index
    // status: null, // String - 'getReady' | Date.now() | 'timesup'
    // wordsLeft: null, // Array - words left to guess.
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
  // TODO later - "Play again" feature? create game with predefined teams?
  console.log(`⚙️ createGame: ${gameName}`, { LOCAL_PROFILE })
  const gameNameLower = gameName.toLowerCase()

  if (slugString(gameName) !== gameNameLower) {
    console.log('::', slugString(gameName), gameNameLower)
    throw new Error('invalid name')
  }

  // Have a passcode to "guarantee" unique game rooms.
  const code = Math.floor(1000 + Math.random() * 9000) // e.g. 3456
  const gameId = `${gameNameLower}_${code}`

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
      code,
      creatorId: LOCAL_PROFILE.id,
    })
  )

  // Prevent duplicated game subs
  PubSub.unsubscribe('game')
  await _unsubGame(gameId)

  setTimeout(() => {
    _pubGame(gameId)
  }, 0)

  return gameId
}

/**
 * gameId = gameSlugged_code
 */
async function joinGame(gameId) {
  console.log(`⚙️ joinGame: ${gameId}`)

  // Verify if we can access the game...
  const id = LOCAL_PROFILE.id
  if (!id) {
    throw new Error('notSigned')
  }

  // Verify if game exists...
  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (!game.exists()) {
    throw new Error('notFound')
  }

  const teams = game.child('teams').val()
  const imInTheGame = game.child('players').child(id).val()

  if (teams && !imInTheGame) {
    // After the teams are made, new players cannot join unless
    // they are already part of the game
    throw new Error('alreadyStarted')
  }

  await DB.ref(`games/${gameId}/players/${id}`).update({
    isAfk: false,
  })

  // Prevent duplicated game subs
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
  // BUG: isAFK sometimes is a negative positive. dunno why.
  //    - Workaround: removed it from the UI for now.
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

    // A kicked-out player cannot remove the game.
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

// TODO simultaneos stuff
// https://firebase.google.com/docs/database/web/read-and-write
// transactions
// https://firebase.google.com/docs/database/web/read-and-write#save_data_as_transactions

/**
 *
 */
async function setWords(words) {
  console.log('⚙️ setWords()', words)
  const gameId = LOCAL_PROFILE.gameId
  const playerId = LOCAL_PROFILE.id

  /*
  To save memory in DB let's store the words as key:value. The key
  is the word index in the array of all words. The final output will be
  something like: (example with 3 words per player)
  words: {
    _all: ['run', 'portugal', 'development', 'card', 'sea', 'cold'],
    playerId1: [0, 1, 2], // run, portugal, development
    playerId2: [3, 4, 5], // card, sea, cold.
  }
  */

  let wordsAsKeys = null

  await DB.ref(`games/${gameId}/words/_all`).transaction(wordsOnce => {
    const wordsStored = wordsOnce || []
    const wordsCount = wordsStored.length
    wordsAsKeys = words.map((w, index) => index + wordsCount)
    const allWords = [...wordsStored, ...words]

    return allWords
  })

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

  // REVIEW/TODO: Maybe round update should be done before, once teams are created.
  const refGameRound = DB.ref(`games/${gameId}/round`)
  const round = await refGameRound.once('value')

  if (!round.exists()) {
    await refGameRound.set(roundStatus)
  } else {
    // To save some kb in data ... I guess. but needs improvement.
    DB.ref(`games/${gameId}/round/wordsLeft`).set(roundStatus.wordsLeft)
  }

  await DB.ref(`games/${gameId}/players/${id}`).update({ isReady: true })

  // REVIEW: Is this the right place?
  // It's a side effect, I never know what's the best place for it.
  // TODO/BUG - Use transaction here to make sure isEveryoneReady for real
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

export async function logEvent(...args) {
  // TODO add support to android.
  // TODO ask for permission in settings.
  // TODO review "Automatically collected events"
  if (!__DEV__) {
    await Analytics.logEvent(...args)
  }
}
