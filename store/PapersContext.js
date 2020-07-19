import React, { Component } from 'react'
import { AsyncStorage } from 'react-native'
import PropTypes from 'prop-types'

import Sentry from '@constants/Sentry'

import wordsForEveryone from './wordsForEveryone.js'
import { getNextTurn } from './papersMethods.js'
import * as PapersSound from './PapersSound.js'

import serverInit from './Firebase.js'

const i18nUnexpectedError = 'Unexpected error. Please try again later.'

const PapersContext = React.createContext({})

export const loadProfile = async () => {
  const id = (await AsyncStorage.getItem('profile_id')) || null
  const name = (await AsyncStorage.getItem('profile_name')) || null
  const avatar = (await AsyncStorage.getItem('profile_avatar')) || null
  const gameId = (await AsyncStorage.getItem('profile_gameId')) || null

  return { id, name, avatar, gameId }
}

export class PapersContextProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: null, // rename to serverAPI?
      profile: {
        id: props.initialProfile.id,
        name: props.initialProfile.name,
        avatar: props.initialProfile.avatar,
        // the last game this player tried to access
        gameId: props.initialProfile.gameId,
      },
      game: null, // see Firebase.js to see structure.
      profiles: {}, // List of game players' profiles.
      about: {
        version: '0.2.2', // TODO REVIEW - where should this come from?
        ota: '17',
      },
    }

    this._removeGameFromState = this._removeGameFromState.bind(this)
    this._subscribeGame = this._subscribeGame.bind(this)

    this.PapersAPI = {
      open: this.open.bind(this),

      // pausePlayer: this.pausePlayer.bind(this),
      // recoverPlayer: this.recoverPlayer.bind(this),

      updateProfile: this.updateProfile.bind(this),
      resetProfile: this.resetProfile.bind(this),

      accessGame: this.accessGame.bind(this),
      leaveGame: this.leaveGame.bind(this),
      removePlayer: this.removePlayer.bind(this),

      setTeams: this.setTeams.bind(this),
      setWords: this.setWords.bind(this),
      setWordsForEveyone: this.setWordsForEveyone.bind(this),

      markMeAsReady: this.markMeAsReady.bind(this),
      markMeAsReadyForNextRound: this.markMeAsReadyForNextRound.bind(this),

      startTurn: this.startTurn.bind(this),
      getNextTurn: this.getNextTurn.bind(this),
      finishTurn: this.finishTurn.bind(this),

      getTurnLocalState: this.getTurnLocalState.bind(this),
      setTurnLocalState: this.setTurnLocalState.bind(this),

      // _startNextRound: this._startNextRound.bind(this),

      playSound: this.playSound.bind(this),
    }
  }

  // Maybe it should be a Route to ask for this,
  // because it might want to retrieve different stuff...
  // ex: on room/:id, I don't care about profile.gameId.
  // Instead I want the room/:id
  async componentDidMount() {
    const { id, name, gameId, avatar } = this.state.profile
    console.log('PapersContext Mounted:', {
      name,
      gameId,
      id,
      avatar: avatar ? 'has avatar' : 'no avatar',
    })
    await this.tryToReconnect()

    // REVIEW - Is this the right moment to load the skins?
    await PapersSound.init()
  }

  componentWillUnmount() {
    this.state.socket && this.state.socket.offAll()

    console.log(`
🎲⏳🎲⏳🎲⏳🎲⏳🎲⏳🎲⏳🎲
::::::::::::::::::::::::::::::
  ... Refreshing app ...
:::::::::::::::::::::::::::::`)
  }

  render() {
    return (
      <PapersContext.Provider
        value={{
          // bannerMsg: this.state.bannerMsg, // Don't do this...
          state: {
            profile: this.state.profile,
            game: this.state.game,
            profiles: this.state.profiles,
            about: this.state.about,
          },
          ...this.PapersAPI,
        }}
      >
        {this.props.children}
      </PapersContext.Provider>
    )
  }

  // =========== Papers API

  open() {
    // Legacy...
  }

  init() {
    console.log('📌 init()')
    let socket = this.state.socket

    if (socket) {
      console.warn('init(): Already connected. Please restart...')
    } else {
      try {
        socket = serverInit()
        this.setState({ socket })
      } catch (e) {
        console.warn(':: error', e)
        Sentry.captureException(e, { tags: { pp_action: 'INIT_0' } })
      }
    }

    return socket
  }

  async tryToReconnect() {
    console.log('📌tryToReconnect()')
    const socket = this.state.socket

    if (socket) {
      console.warn(':: Already connected. Should not happen!')
    } else {
      const { gameId, id } = this.state.profile

      if (!id) {
        console.log(':: no profile id')
        return
      }

      if (!gameId) {
        console.log(':: no gameId')
        return
      }

      await this.accessGame('join', gameId, () => {
        console.log(`Joined to ${gameId} completed!`)
      })
    }
  }

  initAndSign(cb) {
    console.log('📌 initAndSign()')
    const { name, avatar } = this.state.profile

    if (!name) {
      // TODO!! Review all of these edge cases.
      console.warn(`Missing name!`)
      Sentry.captureMessage(`initAndSign: Missing name! ${JSON.stringify(this.state.profile)}`)
      cb(null, 'missing_name') // TODO convert to Error.
      return
    }

    const socket = this.init()

    socket.on('profile.signed', async (topic, id) => {
      console.log('📌 on.profile.signed', id)
      await this.PapersAPI.updateProfile({ id }, { ignoreSocket: true })
      cb()
    })

    socket.on('profile.avatarSet', async (topic, avatar) => {
      console.log('📌 on.profile.avatarSet')
      await this.PapersAPI.updateProfile({ avatar }, { ignoreSocket: true })
    })

    socket.signIn({ name, avatar }, (res, error) => {
      if (error) {
        console.warn(':: signIn failed!', error)
      }
    })
  }

  async accessGame(variant, gameName, cb) {
    if (!this.state.socket || !this.state.profile.id) {
      console.log('📌 accessGame() - init needed first')

      this.initAndSign((res, errorMsg) => {
        if (errorMsg) {
          this._removeGameFromState()
          return cb(null, errorMsg)
        }
        this.accessGame(variant, gameName, cb)
      })

      return
    }

    // OPTMIZE - Verify the profile is updated.
    console.log('📌 accessGame()', variant, gameName)

    if (!gameName) {
      return cb(null, new Error('Missing game name'))
    }

    if (!variant || ['join', 'create'].indexOf(variant) < 0) {
      return cb(null, new Error(`variant incorrect - ${variant}`))
    }

    // createGame | joinGame
    try {
      const gameId = await this.state.socket[`${variant}Game`](gameName)
      this._subscribeGame(gameId)
      this.PapersAPI.updateProfile({ gameId })
      cb(gameId)
    } catch (e) {
      const errorMsgMap = {
        exists: () => 'Choose another name.', // 0.001% probability because code is random.
        notFound: () => "That name or code don't seem right.",
        alreadyStarted: () => 'That game already started.',
        ups: () => i18nUnexpectedError,
      }

      const errorMsg = (errorMsgMap[e.message] || errorMsgMap.ups)()
      const isUnexError = !errorMsgMap[e.message]
      console.warn(':: accessGame failed!', variant, gameName, errorMsg)

      if (isUnexError) {
        Sentry.captureException(e, { tags: { pp_action: 'AG_0' } })
      }
      await this._removeGameFromState()
      return cb(null, errorMsg, { isUnexError })
    }
  }

  _subscribeGame(gameId) {
    console.log('📌 _subscribeGame', gameId)

    const socket = this.state.socket

    const setGame = cb => {
      this.setState(state => {
        if (!state.game) return {}
        return {
          game: {
            ...state.game,
            ...cb(state.game),
          },
        }
      })
    }

    socket.on('game.set', (topic, data) => {
      console.log(`:: on.${topic}`, data.game)
      const { game, profiles } = data
      this.setState({ game, profiles })

      if (!game.hasStarted) {
        // Prevent possible memory leaks from an old game.
        this.PapersAPI.setTurnLocalState(null)
      }
    })

    socket.on('game.players.added', (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const { id, info, profile } = data

      setGame(game => ({
        players: {
          ...game.players,
          [id]: info,
        },
      }))

      this.setState(state => ({
        profiles: {
          ...state.profiles,
          [id]: profile,
        },
      }))
    })

    socket.on('game.players.removed', async (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const { id: playerId /*, newAdmin */ } = data

      if (playerId === this.state.profile.id) {
        console.log(':: we are the player being removed!')
        // OPTIMIZE/BUG - avoid ping pong with firebase the 2nd time is removed.
        // (When being the last to leave the game)
        // this.kickedFromGame() is a better name.
        await this.leaveGame({ wasKicked: true })
        return
      }

      setGame(game => {
        const otherPlayers = Object.keys(game.players).reduce((acc, p) => {
          return p === playerId ? acc : { ...acc, [p]: game.players[p] }
        }, {})

        return {
          // admin: newAdmin, // TODO
          players: otherPlayers,
        }
      })
    })

    socket.on('game.players.changed', (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const { id, info } = data

      setGame(game => ({
        players: {
          ...game.players,
          [id]: {
            ...(game.players[id] || {}),
            ...info,
          },
        },
      }))
    })

    socket.on('game.teams.set', (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const teams = data

      setGame(game => ({
        teams,
      }))
    })

    socket.on('game.words.set', (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const { pId, words } = data // pId can be '_all' too.

      setGame(game => ({
        words: {
          ...game.words,
          [pId]: words,
        },
      }))
    })

    socket.on('game.hasStarted', (topic, data) => {
      console.log(`:: on.${topic}`, data)
      const hasStarted = data

      setGame(game => ({
        hasStarted,
      }))
    })

    socket.on('game.round', (topic, data) => {
      console.log(`:: on.${topic}`)
      const round = data

      setGame(game => ({
        round,
      }))
    })

    socket.on('game.score', (topic, data) => {
      console.log(`:: on.${topic}`)
      const score = data

      setGame(game => ({
        score,
      }))
    })

    socket.on('game.papersGuessed', (topic, data) => {
      console.log(`:: on.${topic}`)
      const papersGuessed = data // Number

      setGame(game => ({
        papersGuessed,
      }))
    })

    socket.on('game.leave', topic => {
      console.log(`:: on.${topic}`)
      this._removeGameFromState()
    })
  }

  // Not needed yet.
  // pausePlayer() {
  //   console.log('pausePlayer');
  //   this.state.socket.emit('pause-player');
  // }

  // recoverPlayer() {
  //   console.log('📌 recoverPlayer');
  //   const socket = this.state.socket.open();
  //   socket.emit('recover-player');
  // }

  // { id, name, avatar, gameId }
  async updateProfile(profile, opts = {}) {
    console.log('📌 updateProfile()', profile, opts)
    const mapKeys = {
      id: 'profile_id',
      name: 'profile_name',
      avatar: 'profile_avatar',
      gameId: 'profile_gameId',
    }

    try {
      for (const key in profile) {
        if (typeof profile[key] === 'string') {
          await AsyncStorage.setItem(mapKeys[key], profile[key])
        } else {
          await AsyncStorage.removeItem(mapKeys[key])
        }
      }
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'UP_0' } })
    }

    const { id, gameId, ...serverProfile } = profile

    if (!opts.ignoreSocket && Object.keys(serverProfile).length > 0) {
      if (this.state.socket) {
        // console.log(':: update socket too.')
        try {
          this.state.socket.updateProfile(serverProfile)
        } catch (e) {
          Sentry.captureException(e, { tags: { pp_action: 'UP_1' } })
          // throw Error(i18nUnexpectedError) // REVIEW later
        }
      } else {
        // console.log(':: not connected to socket')
      }
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
      },
    }))
  }

  async resetProfile(profile) {
    console.log('📌 resetProfile()')
    try {
      await AsyncStorage.removeItem('profile_id')
      await AsyncStorage.removeItem('profile_name')
      await AsyncStorage.removeItem('profile_avatar')
      await AsyncStorage.removeItem('profile_groupId')

      if (this.state.socket) {
        await this.state.socket.resetProfile()
      }
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'RP_0' } })
      // return Error('Unexpected error. Please try again later')
    }

    this.setState(state => ({
      profile: {},
    }))
  }

  async setWords(words) {
    console.log('📌 setWords()')
    try {
      await this.state.socket.setWords(words)
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'SW_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async setWordsForEveyone() {
    console.log('📌 setWordsForEveyone()')
    const allWords = Object.keys(this.state.game.players).reduce((acc, playerId, pIndex) => {
      return {
        ...acc,
        [playerId]: wordsForEveryone[pIndex].map((w, windex) => windex + pIndex * 10),
      }
    }, {})
    allWords._all = wordsForEveryone.slice(0, Object.keys(this.state.game.players).length).flat()
    await this.state.socket.setWordsForEveryone(allWords)
  }

  async setTeams(teams) {
    console.log('📌 setTeams()')
    try {
      await this.state.socket.setTeams(teams)
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'STM_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async markMeAsReady() {
    console.log('📌 markMeAsReady()')

    const roundStatus = {
      current: 0,
      turnWho: { team: 0, 0: 0, 1: 0 }, // Note: ATM supports only 2 teams
      turnCount: 0,
      status: 'getReady',
      // all words by key to save space
      wordsLeft: this.state.game.words._all.map((w, i) => i),
    }

    try {
      this.PapersAPI.playSound('ready')
      await this.state.socket.markMeAsReady(roundStatus)
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'MMAR_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async markMeAsReadyForNextRound() {
    console.log('📌 markMeAsReadyForNextRound()')

    try {
      this.PapersAPI.playSound('ready')
      await this.state.socket.markMeAsReadyForNextRound(() => {
        // REVIEW!! this is dangerours... Only called if everyone's ready!
        this._startNextRound()
      })
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'MMARNR_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  startTurn() {
    console.log('📌 startTurn()')
    try {
      this.PapersAPI.playSound('turnstart')
      this.state.socket.startTurn()
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'STN_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  getNextTurn() {
    const { teams, round } = this.state.game
    return getNextTurn(round.turnWho, teams)
  }

  async finishTurn(papersTurn, cb) {
    console.log('📌 finishTurn()')
    const game = this.state.game
    const profileId = this.state.profile.id
    const { round } = game

    const roundCurrent = round.current
    const current = papersTurn.current ? [papersTurn.current] : []
    const wordsLeft = [...papersTurn.wordsLeft, ...papersTurn.passed, ...current]
    const roundStatus =
      wordsLeft.length > 0
        ? {
            current: roundCurrent,
            turnWho: this.getNextTurn(),
            turnCount: round.turnCount + 1,
            status: 'getReady',
            wordsLeft,
          }
        : {
            current: roundCurrent,
            status: 'finished',
            wordsLeft: [],
          }

    if (!game.score) {
      game.score = []
    }

    if (!game.score[roundCurrent]) {
      game.score[roundCurrent] = {}
    }

    const wordsSoFar = game.score[roundCurrent][profileId] || []

    const allValidWordsGuessed = [...wordsSoFar, ...papersTurn.guessed].filter(word => {
      if (word === undefined) {
        console.warn(
          ':: Undefined word guessed avoided!', // to avoid DB errors!
          wordsSoFar,
          papersTurn.guessed
        )
        Sentry.captureMessage('Undefined word guessed avoided!')
        return false
      }
      return true
    })

    const uniqueWordsGuessed = allValidWordsGuessed.filter((paper, index) => {
      // Avoid submitting duplicated papers. I don't know how,
      // but already happened IRL and din't understand the cause.
      // Probably the player clicked twice (in a slow phone) to submit their score
      // and the UI didn't block the second click? So it submitted twice.
      const isUnique = papersTurn.sorted.indexOf(paper) === index
      if (!isUnique) {
        console.warn(':: Duplicated word guessed avoided!', paper, index)
        Sentry.captureMessage('Duplicated word guessed avoided!')
      }
      return isUnique
    })

    try {
      await this.state.socket.finishTurn({
        playerScore: {
          [profileId]: uniqueWordsGuessed,
        },
        roundStatus,
      })
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'FNTR_0' } })
      // Do not throw error. UI is not ready for it.
    }
  }

  _startNextRound() {
    console.log('📌 _startNextRound()')
    const game = this.state.game

    // NOTE: No need for try/catch because it's used in this component
    // only that already has its own try catch
    this.state.socket.setRound({
      current: game.round.current + 1,
      status: 'getReady',
      turnWho: this.getNextTurn(),
      turnCount: 0,
      // all words by key to save space // dry across file
      wordsLeft: game.words._all.map((w, i) => i),
    })
  }

  async setTurnLocalState(turn) {
    console.log('📌 setPaperTurnState()') // a better name perhaps?

    try {
      if (turn) {
        await AsyncStorage.setItem('turn', JSON.stringify(turn))
        const papersGuessed = turn.guessed.length

        if (papersGuessed !== this.state.game.papersGuessed) {
          // Send this, so all players know N papers were guessed so far.
          this.state.socket.setPapersGuessed(papersGuessed)
        }
      } else {
        await AsyncStorage.removeItem('turn')
      }
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'STLS_0' } })
      // Do not throw error. UI is not ready for it.
    }
  }

  async getTurnLocalState() {
    console.log('📌 getPaperTurnState()')
    const storedTurn = await AsyncStorage.getItem('turn')
    const turnState = JSON.parse(storedTurn) || {
      current: null, // String - current paper on the screen (id)
      passed: [], // [String] - papers passed
      guessed: [], // [String] - papers guessed
      sorted: [], // [Number] - papers guessed/passed sorted chronologically
      wordsLeft: this.state.game.round.wordsLeft, // [String] - words left
    }
    return turnState
  }

  async _removeGameFromState() {
    console.log('📌 _removeGameFromState()')

    // Don't add try catch. If this fails, its critical,
    // so it's better to show the ErrorRecovery page... i guess.
    this.PapersAPI.setTurnLocalState(null)
    await this.PapersAPI.updateProfile({ gameId: null })
    this.setState(state => ({ game: null }))
  }

  async leaveGame(opts) {
    console.log('📌 leaveGame()')

    try {
      await this.state.socket.leaveGame(opts)
    } catch (e) {
      this._removeGameFromState()
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'LVG_0' } })
    }
  }

  async removePlayer(playerId) {
    console.log('📌 removePlayer()')
    try {
      await this.state.socket.removePlayer(playerId)
      // eventually pub on 'players.removed' will be called
    } catch (e) {
      console.warn(':: error', e)
      Sentry.captureException(e, { tags: { pp_action: 'RMP_0' } })
    }
  }

  playSound(soundId) {
    PapersSound.play(soundId)
  }
}

PapersContextProvider.propTypes = {
  initialProfile: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
    gameId: PropTypes.string,
  }),
  children: PropTypes.node,
}

export default PapersContext
