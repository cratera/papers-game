// TODO: REVIEW: I assume this entire file would be a set of "Cloud Functions".

// TODO: Refactor to the modular style https://firebase.google.com/docs/web/modular-upgrade#refactor_to_the_modular_style
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import 'firebase/compat/storage'

import PubSub from 'pubsub-js'

import { analytics as Analytics } from '@src/services/firebase'
import * as Sentry from '@src/services/sentry'
import { formatSlug } from '@src/utils/formatting'
import { Game, GameTeams, PapersContextState, Profile, Round, Score } from './PapersContext.types'

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

let LOCAL_PROFILE: Profile // not sure if this is good.
let DB: firebase.database.Database // firebase database

const PUBLIC_API = {
  on,
  offAll,
  signIn,
  updateProfile, // setUser?
  resetProfile,

  createGame,
  joinGame,
  leaveGame,

  removePlayer,

  setTeams,
  setWords,
  setWordsForEveryone,

  startGame,

  markMeAsReady,
  markMeAsReadyForNextRound,

  pingReadyStatus,

  startTurn,
  setPapersGuessed,
  finishTurn,
  skipTurn,
  setRound,
}

export default function init() {
  if (__DEV__) console.log('⚙️ init()')

  if (firebase.apps.length > 0) {
    if (__DEV__) console.log('Already initialized!')
  } else {
    firebase.initializeApp(firebaseConfig)
  }

  DB = firebase.database()

  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      LOCAL_PROFILE.id = user.uid
      LOCAL_PROFILE.isAfk = false
      if (__DEV__) console.log('⚙️ Signed!', LOCAL_PROFILE.id)

      await updateProfile(LOCAL_PROFILE)
      await Analytics.setUserId(LOCAL_PROFILE.id)
      PubSub.publish('profile.signed', LOCAL_PROFILE.id)
    } else {
      // User is signed out.
    }
  })

  return PUBLIC_API
}

/**
 * PubSub system. Bridge between PapersContext and Firebase events.
 */
// TODO: create typed PubSub wrapper functions where we can map the event name to the payload type.
function on(...params: Parameters<typeof PubSub.subscribe>) {
  if (__DEV__) console.log('⚙️ on()', params[0])
  PubSub.subscribe(...params)
}

async function offAll() {
  const gameId = LOCAL_PROFILE.gameId
  if (__DEV__) console.log('⚙️ offAll(), Firebase disconnecting!', gameId)
  PubSub.clearAllSubscriptions()

  if (gameId) {
    _unsubGame(gameId)
  }
}

// ==== AUTH / PROFILE ==== //

/**
 * Do Auth. Needed before accessing to a game
 */
function signIn({ name, avatar }: Pick<Profile, 'name' | 'avatar'>, cb: (error: Error) => void) {
  LOCAL_PROFILE = { ...LOCAL_PROFILE, name, avatar }

  firebase
    .auth()
    .signInAnonymously()
    .catch(function (error: Error) {
      console.warn('signInAnonymously error:', error)
      cb(error)
    })
}

/**
 * Update profile
 */
async function updateProfile(profile: Partial<Profile>) {
  if (__DEV__) console.log('⚙️ updateProfile()', profile)

  try {
    DB.ref('users/' + LOCAL_PROFILE.id).update(profile)
  } catch (error) {
    console.warn(':: updateProfile failed!', error)
    Sentry.captureException(error)
  }

  return profile
}

/**
 * Reset profile - delete the profile from the DB.
 */
async function resetProfile(id: Profile['id']) {
  if (__DEV__) console.log('⚙️ resetProfile()', id)

  await DB.ref('users/' + id).remove()
  Analytics.resetAnalyticsData()
}

// ==== GAME ==== //

const gameInitialState = ({
  id,
  name,
  code,
  creatorId,
}: Pick<Game, 'id' | 'name' | 'code' | 'creatorId'>): Game => ({
  id,
  name,
  code,
  creatorId,
  hasStarted: false,
  players: {
    [creatorId]: {
      isAfk: false,
      isReady: false,
    },
  },
  words: null,
  teams: null,
  papersGuessed: 0,
  round: null,
  score: null,
  settings: {
    roundsCount: 3,
    words: 10,
    time_ms: [45000, 45000, 60000],
  },
})

/**
 *
 */
async function createGame(gameName: Game['name']) {
  // TODO: later - "Play again" feature? create game with predefined teams?
  if (__DEV__) console.log(`⚙️ createGame: ${gameName}`, { LOCAL_PROFILE })
  const gameNameLower = gameName.toLowerCase()

  // Verify if we can create the game...
  const id = LOCAL_PROFILE.id
  if (!id) {
    throw new Error('notSigned')
  }

  if (formatSlug(gameName) !== gameNameLower) {
    if (__DEV__) console.log('::', formatSlug(gameName), gameNameLower)
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

  // Create the game!
  await DB.ref(`games/${gameId}`).set(
    gameInitialState({
      id: gameId,
      name: gameName,
      code: code.toString(),
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
 *
 */
async function joinGame(gameId: Game['id']) {
  if (__DEV__) console.log(`⚙️ joinGame: ${gameId}`)

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

  // TODO: later review all the logic around isAfk and fix false positives.
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
 */
function _pubGame(gameId: Game['id']) {
  LOCAL_PROFILE.gameId = gameId
  if (__DEV__) console.log('⚙️ _pubGame', gameId)

  // Subscribe to initial game set!
  DB.ref(`games/${gameId}`).once('value', async function (data) {
    const game = data.val()

    // Retrieve game players' profiles!
    const profiles: PapersContextState['profiles'] = {}
    for (const playerId in game.players) {
      if (playerId === LOCAL_PROFILE.id) {
        profiles[playerId] = {
          ...profiles[playerId],
          name: LOCAL_PROFILE.name,
          avatar: LOCAL_PROFILE.avatar,
        }
      } else {
        const profile = await DB.ref(`users/${playerId}`).once('value')
        profiles[playerId] = profile.val()
      }
    }

    // Set the initial state of the game.
    if (__DEV__) console.log('⚙️ pub.game.set')
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

      DB.ref(`users/${id}/isAfk`).on('value', (data) => {
        const isAfk = data.val()
        if (!isAfk) return

        if (__DEV__) console.log('⚙️ player is afk!', id)
        PubSub.publish('game.players.changed', {
          id,
          info: {
            isAfk,
          },
        })
      })
    })
    DB_PLAYERS.on('child_removed', function (data) {
      const id = data.key

      DB.ref(`users/${id}/isAfk`).off('value')

      PubSub.publish('game.players.removed', {
        id,
        newAdmin: null, // TODO: later
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
  // const isAfkRef = firebase.database().ref(`users/${LOCAL_PROFILE.id}/isAfk`)
  // isAfkRef.onDisconnect().set(true) // TODO: subscribe
  //  TODO: (BUG) isAFK sometimes is a negative positive. dunno why.
  //    - Workaround: removed it from the UI for now.
}

/**
 *
 */
async function leaveGame({ wasKicked }: { wasKicked?: boolean } = {}) {
  if (__DEV__) console.log('⚙️ leaveGame()', { wasKicked }, LOCAL_PROFILE.id)
  const gameId = LOCAL_PROFILE.gameId

  // already excluded from game, no need to remove again...
  if (!wasKicked) {
    const gameRef = DB.ref(`games/${gameId}`)
    const game = await gameRef.once('value')

    if (Object.keys(game.val().players).length === 1) {
      if (__DEV__) console.log(':: last player - remove game')
      DB.ref(`games/${gameId}`).remove()
    } else {
      if (__DEV__) console.log(':: removing')
      await DB.ref(`games/${gameId}/players/${LOCAL_PROFILE.id}`).update({ isAfk: true })
    }
  }

  // ...just leave/unsub it.
  // TODO: When leaving the game, this is called twice (see logs).
  // Not ideally but better twice than never.
  PubSub.publish('game.leave')

  if (gameId) {
    await _unsubGame(gameId)
  }

  setTimeout(() => {
    if (__DEV__) console.log('⚙️ Unsubscribe game')
    PubSub.unsubscribe('game')
  }, 0) // TODO: Why did I use timeout here?
}

async function _unsubGame(gameId: Game['id']) {
  if (__DEV__) console.log('⚙️ _unsubGame()', gameId)

  // Disconnect from game
  DB.ref(`games/${gameId}`).off()
}

/**
 *
 */
async function removePlayer(playerId: Profile['id']) {
  const gameId = LOCAL_PROFILE.gameId
  if (__DEV__) console.log('⚙️ removePlayer()', gameId, playerId)

  const gameRef = DB.ref(`games/${gameId}`)
  const game = await gameRef.once('value')

  if (!game.exists()) {
    throw new Error('notFound')
  }

  if (__DEV__) console.log(':: removing player')
  await DB.ref(`games/${gameId}/players/${playerId}`).remove()
}
/**
 *
 */
async function setTeams(teams: GameTeams) {
  if (__DEV__) console.log('⚙️ setTeams()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/teams`).set(teams)
}

// TODO: simultaneos stuff
// https://firebase.google.com/docs/database/web/read-and-write
// transactions
// https://firebase.google.com/docs/database/web/read-and-write#save_data_as_transactions

/**
 *
 */
async function setWords(words: string[]) {
  if (__DEV__) console.log('⚙️ setWords()', words)
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
  const refPlayerWords = DB.ref(`games/${gameId}/words/${playerId}`)
  const playerWords = await refPlayerWords.once('value')

  if (playerWords.exists()) {
    // This might happen when the player submits twice (double click)
    // Already happened in a slow iphone 5 phone and on iPhone X.
    // Can't replicate locally though.
    throw Error('Papers already submitted.')
  }

  await DB.ref(`games/${gameId}/words/_all`).transaction((wordsOnce) => {
    const wordsStored = wordsOnce || []
    const wordsCount = wordsStored.length
    wordsAsKeys = words.map((_, index) => index + wordsCount)
    const allWords = [...wordsStored, ...words]

    return allWords
  })

  await refPlayerWords.set(wordsAsKeys)
}

/**
 * a shortcut for dev only.
 */
async function setWordsForEveryone(allWords: Game['words']) {
  if (__DEV__) console.log('⚙️ setWordsForEveyone()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/words`).set(allWords)
}

// ====================================

async function startGame() {
  if (__DEV__) console.log('⚙️ startGame()')
  const { gameId } = LOCAL_PROFILE

  await DB.ref(`games/${gameId}/hasStarted`).set(true)
}

async function _getIsEveryoneReady(gameId: Game['id']) {
  const playersRef = await DB.ref(`games/${gameId}/players`).once('value')
  const players = playersRef.val()
  const isEveryoneReady = Object.keys(players).every((pId) => players[pId].isReady)

  if (!isEveryoneReady) {
    if (__DEV__) console.log(':: everyone is ready: NO')
    return false
  }

  if (__DEV__) console.log(':: everyone is ready: YES')
  return true
}
/**
 *
 */
async function markMeAsReady(roundStatus: Game['round'], everyonesReadyCb: EmptyCallback) {
  if (__DEV__) console.log('⚙️ markMeAsReady()')
  const { gameId, id } = LOCAL_PROFILE

  // TODO: REVIEW Maybe round update should be done before, once teams are created.
  const refGameRound = DB.ref(`games/${gameId}/round`)
  const round = await refGameRound.once('value')

  if (!round.exists()) {
    await refGameRound.set(roundStatus)
  } else {
    // To save some kb in data ... I guess. but needs improvement.
    DB.ref(`games/${gameId}/round/wordsLeft`).set(roundStatus?.wordsLeft)
  }

  await DB.ref(`games/${gameId}/players/${id}`).update({ isReady: true })

  // REVIEW: Is this the right place?
  // It's a side effect, I never know what's the best place for it.
  // TODO: (POSSIBLE BUG) - Use transaction here to make sure isEveryoneReady for real
  if (gameId && (await _getIsEveryoneReady(gameId))) {
    // Should this be responsability of context or firebase?
    everyonesReadyCb()
  }
}

async function markMeAsReadyForNextRound(everyonesReadyCb: EmptyCallback) {
  if (__DEV__) console.log('⚙️ markMeAsReadyForNextRound()')
  const { gameId, id } = LOCAL_PROFILE

  await DB.ref(`games/${gameId}/players/${id}`).update({ isReady: true })

  // Same concern as markMeAsReady
  if (gameId && (await _getIsEveryoneReady(gameId))) {
    everyonesReadyCb()
  }
}

/**
 * Use this to prevent bugs related to markMeAsReady* calls
 */
async function pingReadyStatus() {
  if (__DEV__) console.log('⚙️ pingReadyStatus()')
  const { gameId } = LOCAL_PROFILE

  if (gameId) {
    return _getIsEveryoneReady(gameId)
  }
}
/**
 *
 */
async function startTurn() {
  if (__DEV__) console.log('⚙️ startTurn()')
  const gameId = LOCAL_PROFILE.gameId

  // The client is responsible for the countdown and then
  // it sends 'finishTurn()' with score. It saves on IO events for each second.
  await DB.ref(`games/${gameId}/round/status`).set(Date.now())
}

function setPapersGuessed(count: Game['papersGuessed']) {
  if (__DEV__) console.log('⚙️ setPapersGuessed()', count)
  const gameId = LOCAL_PROFILE.gameId

  DB.ref(`games/${gameId}/papersGuessed`).set(count)
}

/**
 *
 */
async function finishTurn({
  playerScore,
  roundStatus,
}: {
  playerScore: Score
  roundStatus: Round
}) {
  if (__DEV__) console.log('⚙️ finishTurn()')
  const gameId = LOCAL_PROFILE.gameId

  if (roundStatus.status === 'finished') {
    // Mark players as not ready for the next round.
    // In RoundScore they'll mark themselves again as ready.
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
}

/**
 *
 */
async function skipTurn({ roundStatus }: { roundStatus: Round }) {
  if (__DEV__) console.log('⚙️ skipTurn()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/round`).update(roundStatus)
  await DB.ref(`games/${gameId}/papersGuessed`).set(0)
}

/**
 *
 */
async function setRound(roundStatus: Round) {
  if (__DEV__) console.log('⚙️ startNextRound()')
  const gameId = LOCAL_PROFILE.gameId

  await DB.ref(`games/${gameId}/round`).set(roundStatus)
}
