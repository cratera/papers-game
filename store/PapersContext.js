import React, { Component } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PropTypes from 'prop-types'

import { isWeb } from '@constants/layout'
import Sentry from '@constants/Sentry'

import wordsForEveryone from './wordsForEveryone.js'
import { getNextTurn } from './papersMethods.js'
import * as PapersSound from './PapersSound.js'

import serverInit from './Firebase.js'
import * as Analytics from '@constants/analytics.js'

const i18nUnexpectedError = 'Unexpected error. Please try again later.'

const PapersContext = React.createContext({})

const settingsDefaults = { sound: !__DEV__, motion: !isWeb }
const statsDefaults = {
  // NOTE: If you change this, don't forget Statistics.js
  gamesCreated: 0,
  gamesJoined: 0,
  gamesWon: 0,
  gamesLost: 0,
  papersGuessed: 0,
}

export const loadProfile = async () => {
  const id = (await AsyncStorage.getItem('profile_id')) || null
  const name = (await AsyncStorage.getItem('profile_name')) || null
  const avatar = (await AsyncStorage.getItem('profile_avatar')) || null
  const gameId = (await AsyncStorage.getItem('profile_gameId')) || null
  const settingsStored = (await AsyncStorage.getItem('profile_settings')) || null
  const statsStored = (await AsyncStorage.getItem('profile_stats')) || null

  return {
    id,
    name,
    avatar,
    gameId,
    settings: JSON.parse(settingsStored) || settingsDefaults,
    stats: JSON.parse(statsStored) || statsDefaults,
  }
}

export class PapersContextProvider extends Component {
  constructor(props) {
    super(props)

    // TODO save this on localStorage. Update: Why? lol
    this.config = {
      // myTeamId: Number,
      // roundDuration: Number
    }

    this.state = {
      socket: null, // rename to serverAPI?
      profile: {
        id: props.initialProfile.id,
        name: props.initialProfile.name,
        avatar: props.initialProfile.avatar,
        gameId: props.initialProfile.gameId, // the last game accessed
        settings: props.initialProfile.settings || {},
        stats: props.initialProfile.stats,
      },
      game: null, // see Firebase.js for structure.
      profiles: {}, // List of game players' profiles.
      about: {
        version: '0.3.1',
        ota: '05.2',
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
      updateProfileSettings: this.updateProfileSettings.bind(this),
      resetProfileSettings: this.resetProfileSettings.bind(this),
      resetProfileStats: this.resetProfileStats.bind(this),

      accessGame: this.accessGame.bind(this),
      leaveGame: this.leaveGame.bind(this),
      abortGameGate: this.abortGameGate.bind(this),
      removePlayer: this.removePlayer.bind(this),

      setTeams: this.setTeams.bind(this),
      setWords: this.setWords.bind(this),
      setWordsForEveyone: this.setWordsForEveyone.bind(this),

      markMeAsReady: this.markMeAsReady.bind(this),
      markMeAsReadyForNextRound: this.markMeAsReadyForNextRound.bind(this),
      pingReadyStatus: this.pingReadyStatus.bind(this),

      startTurn: this.startTurn.bind(this),
      getNextTurn: this.getNextTurn.bind(this),
      finishTurn: this.finishTurn.bind(this),

      getTurnLocalState: this.getTurnLocalState.bind(this),
      setTurnLocalState: this.setTurnLocalState.bind(this),

      deleteGame: this.deleteGame.bind(this),

      soundToggleStatus: this.soundToggleStatus.bind(this),
      soundPlay: this.soundPlay.bind(this),

      motionToggle: this.motionToggle.bind(this),

      sendTracker: this.sendTracker.bind(this),
    }
  }

  async componentDidMount() {
    const { avatar, ...profile } = this.state.profile
    console.log('Papers mounted:', profile)
    await this.tryToReconnect()

    await PapersSound.init(profile.settings.sound)
  }

  componentWillUnmount() {
    this.state.socket && this.state.socket.offAll()

    if (__DEV__)
      console.log(`
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
    if (__DEV__) console.log('📌 init()')
    let socket = this.state.socket

    if (socket) {
      if (__DEV__) console.warn('init(): Already connected. Please restart...')
      Sentry.captureMessage('Warn: Init - Socket already connected.')
    } else {
      try {
        socket = serverInit()
        this.setState({ socket })
      } catch (e) {
        console.warn('error init', e)
        Sentry.captureException(e, { tags: { pp_action: 'INIT_02' } })
      }
    }

    return socket
  }

  async tryToReconnect() {
    if (__DEV__) console.log('📌tryToReconnect()')
    const socket = this.state.socket

    if (socket) {
      console.warn(':: Already connected. Should not happen!')
      Sentry.captureMessage('Warn: tR Socket already connected.')
    } else {
      const { gameId, id } = this.state.profile

      if (!id) {
        if (__DEV__) console.log(':: no profile id')
        return
      }

      if (!gameId) {
        if (__DEV__) console.log(':: no gameId')
        return
      }

      await this.accessGame(
        'join',
        gameId,
        () => {
          if (__DEV__) console.log(`Joined ${gameId} completed!`)
        },
        { automatic: true }
      )
    }
  }

  initAndSign(cb) {
    if (__DEV__) console.log('📌 initAndSign()')
    const { name, avatar } = this.state.profile

    if (!name) {
      // TODO!! Review all of these edge cases.
      Sentry.captureMessage(`initAndSign: Missing name! ${JSON.stringify(this.state.profile)}`)
      cb(null, 'missing_name') // TODO convert to Error.
      return
    }

    const socket = this.init()

    socket.on('profile.signed', async (topic, id) => {
      if (__DEV__) console.log('📌 on.profile.signed', id)
      await this.PapersAPI.updateProfile({ id }, { ignoreSocket: true })
      cb()
    })

    socket.on('profile.avatarSet', async (topic, avatar) => {
      if (__DEV__) console.log('📌 on.profile.avatarSet')
      await this.PapersAPI.updateProfile({ avatar }, { ignoreSocket: true })
    })

    socket.signIn({ name, avatar }, (res, error) => {
      if (error) {
        Sentry.captureMessage(`socket.signIn: error ${JSON.stringify(error)}`)
      }
    })
  }

  async accessGame(variant, gameName, cb, customOpts = {}) {
    const opts = {
      // Pass true when the access is internally made, rather than user interaction (eg on App refresh/restart)
      automatic: false,
      ...customOpts,
    }

    if (!this.state.socket || !this.state.profile.id) {
      if (__DEV__) console.log('📌 accessGame() - init needed first')

      this.initAndSign((res, errorMsg) => {
        if (errorMsg) {
          this._removeGameFromState()
          return cb(null, errorMsg)
        }
        this.accessGame(variant, gameName, cb, opts)
      })
      return
    }

    if (__DEV__) console.log('📌 accessGame()', variant, gameName)

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

      if (!opts.automatic) {
        const statKey = variant === 'create' ? 'gamesCreated' : 'gamesJoined'
        Analytics.logEvent(`${variant}_game`, {
          count: this.state.profile.stats[statKey] + 1,
        })
        this.updateProfileStats(statKey, 1)
      }
      cb(gameId)
    } catch (e) {
      const errorMsgMap = {
        notSigned: () => 'Cannot find your profile. Please start over.', // I hope this never happens.
        exists: () => 'Choose another name.', // 0.001% probability because code is random.
        notFound: () => `Wrong code for ${gameName.split('_')[0]}.`,
        alreadyStarted: () => 'That game already started.',
        ups: () => i18nUnexpectedError,
      }

      const errorMsg = (errorMsgMap[e.message] || errorMsgMap.ups)()
      const isUnexError = !errorMsgMap[e.message]

      if (isUnexError) {
        console.warn(':: accessGame failed!', variant, gameName, e, errorMsg)
        Sentry.captureException(e, { tags: { pp_action: 'AG_0' } })
      }
      await this._removeGameFromState()
      return cb(null, errorMsg, { isUnexError })
    }
  }

  _subscribeGame(gameId) {
    if (__DEV__) console.log('📌 _subscribeGame', gameId)

    const socket = this.state.socket

    const setGame = (cb, afterUpdate) => {
      this.setState(state => {
        if (!state.game) return {}
        return {
          game: {
            ...state.game,
            ...cb(state.game),
          },
        }
      }, afterUpdate)
    }

    socket.on('game.set', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data.game)
      const { game, profiles } = data
      this.setState({ game, profiles })

      if (!game.hasStarted) {
        // Prevent possible memory leaks from an old game.
        this.config = {}
        this.PapersAPI.setTurnLocalState(null)
      }
    })

    socket.on('game.players.added', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
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
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { id: playerId /*, newAdmin */ } = data

      if (playerId === this.state.profile.id) {
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
      if (__DEV__) console.log(`:: on.${topic}`, data)
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
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const teams = data
      setGame(
        game => ({
          teams,
        }),
        () => this._storeMyTeam()
      )
    })

    socket.on('game.words.set', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { pId, words } = data // pId can be '_all' too.

      setGame(game => ({
        words: {
          ...game.words,
          [pId]: words,
        },
      }))
    })

    socket.on('game.hasStarted', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const hasStarted = data
      if (hasStarted) {
        // REVIEW - This is called on page refresh. it shouldn't happen.
        Analytics.logEvent('game_started', {
          players: Object.keys(this.state.game.players).length,
        })
      }
      setGame(game => ({
        hasStarted,
      }))
    })

    socket.on('game.round', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const round = data

      setGame(game => ({
        round,
      }))
    })

    socket.on('game.score', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const score = data

      setGame(game => ({
        score,
      }))
    })

    socket.on('game.papersGuessed', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const papersGuessed = data // Number

      setGame(game => ({
        papersGuessed,
      }))
    })

    socket.on('game.leave', topic => {
      if (__DEV__) console.log(`:: on.${topic}`)
      this._removeGameFromState()
    })
  }

  // { id, name, avatar, gameId }
  async updateProfile(profile, opts = {}) {
    if (__DEV__) console.log('📌 updateProfile()', profile, opts)
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
      console.warn('error: updateProfile AS', e)
      Sentry.captureException(e, { tags: { pp_action: 'UP_0' } })
    }

    const { id, gameId, ...serverProfile } = profile

    if (!opts.ignoreSocket && Object.keys(serverProfile).length > 0) {
      if (this.state.socket) {
        try {
          this.state.socket.updateProfile(serverProfile)
        } catch (e) {
          console.warn('error: updateProfile socket', e)
          Sentry.captureException(e, { tags: { pp_action: 'UP_1' } })
          // throw Error(i18nUnexpectedError) // REVIEW later
        }
      }
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        ...profile,
      },
    }))
  }

  async updateProfileSettings(setting, value) {
    if (__DEV__) console.log('📌 updateProfileSettings()', setting, value)

    this.setState(
      state => ({
        profile: {
          ...state.profile,
          settings: {
            ...state.profile.settings,
            [setting]: value,
          },
        },
      }),
      async () => {
        const newSettings = this.state.profile.settings
        try {
          await AsyncStorage.setItem('profile_settings', JSON.stringify(newSettings))
        } catch (e) {
          console.warn('error: updateProfileSettings', e)
          Sentry.captureException(e, { tags: { pp_action: 'UP_1' } })
        }
      }
    )
  }

  async updateProfileStats(statKey, valueToAdd) {
    // Similar to updateProfileSettings. Could be DRY but it's ok...
    if (__DEV__) console.log('📌 updateProfileStats()', statKey, valueToAdd)

    this.setState(
      state => ({
        profile: {
          ...state.profile,
          stats: {
            ...state.profile.stats,
            [statKey]: state.profile.stats[statKey] + valueToAdd,
          },
        },
      }),
      async () => {
        const newStats = this.state.profile.stats
        try {
          await AsyncStorage.setItem('profile_settings', JSON.stringify(newStats))
        } catch (e) {
          console.warn('error: updateProfileStats', e)
          Sentry.captureException(e, { tags: { pp_action: 'UPS_1' } })
        }
      }
    )
  }

  async resetProfile(profile) {
    if (__DEV__) console.log('📌 resetProfile()')
    try {
      await AsyncStorage.removeItem('profile_id')
      await AsyncStorage.removeItem('profile_name')
      await AsyncStorage.removeItem('profile_avatar')
      await AsyncStorage.removeItem('profile_groupId')
      await AsyncStorage.removeItem('profile_settings')
      await AsyncStorage.removeItem('profile_stats')

      if (this.state.socket) {
        await this.state.socket.resetProfile()
        this.state.socket.offAll()
        this.setState(state => ({
          ...state,
          socket: null,
        }))
      }
    } catch (e) {
      console.warn('error: resetProfile', e)
      Sentry.captureException(e, { tags: { pp_action: 'RP_0' } })
      // return Error('Unexpected error. Please try again later')
    }

    this.setState(state => ({
      profile: {},
    }))
  }

  async resetProfileSettings(profile) {
    if (__DEV__) console.log('📌 resetProfileSettings()')
    try {
      await AsyncStorage.removeItem('profile_settings')
    } catch (e) {
      console.warn('error: profile_settings', e)
      Sentry.captureException(e, { tags: { pp_action: 'RPSET_0' } })
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        settings: settingsDefaults,
      },
    }))
  }

  async resetProfileStats(profile) {
    if (__DEV__) console.log('📌 resetProfileStats()')
    try {
      await AsyncStorage.removeItem('profile_stats')
    } catch (e) {
      console.warn('error: resetProfileStats', e)
      Sentry.captureException(e, { tags: { pp_action: 'RPSTA_0' } })
    }

    this.setState(state => ({
      profile: {
        ...state.profile,
        stats: statsDefaults,
      },
    }))
  }

  async setWords(words) {
    if (__DEV__) console.log('📌 setWords()')
    try {
      await this.state.socket.setWords(words)
    } catch (e) {
      console.warn('error: setWords', e)
      Sentry.captureException(e, { tags: { pp_action: 'SW_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async setWordsForEveyone() {
    if (__DEV__) console.log('📌 setWordsForEveyone()')
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
    if (__DEV__) console.log('📌 setTeams()')
    try {
      await this.state.socket.setTeams(teams)
      Analytics.logEvent('game_setTeams', { players: Object.keys(this.state.game.players).length })
    } catch (e) {
      console.warn('error: setTeams', e)
      Sentry.captureException(e, { tags: { pp_action: 'STM_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async markMeAsReady() {
    if (__DEV__) console.log('📌 markMeAsReady()')

    const roundStatus = {
      current: 0,
      turnWho: { team: 0, 0: 0, 1: 0 }, // Note: ATM supports only 2 teams
      turnCount: 0,
      status: 'getReady',
      // all words by key to save space
      wordsLeft: this.state.game.words._all.map((w, i) => i),
    }

    try {
      this.PapersAPI.soundPlay('ready')
      await this.state.socket.markMeAsReady(roundStatus, () => {
        this.state.socket.startGame()
      })
      this.config.roundDuration = Date.now()
      Analytics.logEvent(`game_imReadyToRound_1`, {
        players: Object.keys(this.state.game.players).length,
      })
    } catch (e) {
      console.warn('error: markMeAsReady', e)
      Sentry.captureException(e, { tags: { pp_action: 'MMAR_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async markMeAsReadyForNextRound() {
    if (__DEV__) console.log('📌 markMeAsReadyForNextRound()')

    try {
      this.PapersAPI.soundPlay('ready')
      await this.state.socket.markMeAsReadyForNextRound(() => {
        this._startNextRound()
      })

      this.config.roundDuration = Date.now()
      Analytics.logEvent(`game_imReadyToRound_${this.state.game.round.current + 2}`, {
        players: Object.keys(this.state.game.players).length,
      })
    } catch (e) {
      console.warn('error: markMeAsReadyForNextRound', e)
      Sentry.captureException(e, { tags: { pp_action: 'MMARNR_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async pingReadyStatus() {
    if (__DEV__) console.log('📌 pingReadyStatus()')
    try {
      const isAllReady = await this.state.socket.pingReadyStatus()

      if (!isAllReady) return

      if (!this.state.game.hasStarted) {
        console.log(':: start game!')
        this.state.socket.startGame()
      } else {
        console.log(':: start next round!')
        this._startNextRound()
      }
    } catch (e) {
      console.warn('error: pingReadyStatus', e)
      Sentry.captureException(e, { tags: { pp_action: 'ping_0' } })
      throw Error('Unable to check other players status')
    }
  }

  startTurn() {
    if (__DEV__) console.log('📌 startTurn()')
    try {
      this.PapersAPI.soundPlay('turnstart')
      this.state.socket.startTurn()
    } catch (e) {
      console.warn('error: startTurn', e)
      Sentry.captureException(e, { tags: { pp_action: 'STN_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  getNextTurn() {
    const { teams, round } = this.state.game
    return getNextTurn(round.turnWho, teams)
  }

  async finishTurn(papersTurn, cb) {
    if (__DEV__) console.log('📌 finishTurn()')
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
      // but already happened IRL and I din't understand the cause.
      // Probably the player clicked twice (in a slow phone) to submit their score
      // and the UI didn't block the second click? So it submitted each paper twice.
      const isUnique = allValidWordsGuessed.indexOf(paper) === index
      if (!isUnique) {
        console.warn(':: Duplicated word guessed avoided!', allValidWordsGuessed, paper, index)
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
      Analytics.logEvent('finish_turn', {
        round: roundCurrent + 1,
        turn: round.turnCount + 1,
        teamSize: game.teams[this.config.myTeamId]?.players.length || 0,
        yes: papersTurn.guessed.length,
        no: papersTurn.passed.length,
        toggled_to_yes: papersTurn.toggled_to_yes,
        toggled_to_no: papersTurn.toggled_to_no,
        revealed: papersTurn.revealed,
      })
    } catch (e) {
      console.warn('error: finishTurn', e)
      Sentry.captureException(e, { tags: { pp_action: 'FNTR_0' } })
      // Do not throw error. UI is not ready for it.
    }
  }

  _storeMyTeam() {
    const teams = this.state.game.teams
    let myTeamId

    for (const teamId in teams) {
      const isMyTeam = teams[teamId].players.some(pId => pId === this.state.profile.id)
      if (isMyTeam) {
        myTeamId = teamId
        break
      }
    }

    if (__DEV__) console.log('📌 _storeMyTeam()', myTeamId)
    this.config.myTeamId = myTeamId
  }

  async _startNextRound() {
    if (__DEV__) console.log('📌 _startNextRound()')
    const game = this.state.game

    // NOTE: No need for try/catch because it's used in this component
    // only that already has its own try catch
    await this.state.socket.setRound({
      current: game.round.current + 1,
      status: 'getReady',
      turnWho: this.getNextTurn(),
      turnCount: 0,
      // all words by key to save space // dry across file
      wordsLeft: game.words._all.map((w, i) => i),
    })
  }

  async setTurnLocalState(turn) {
    if (__DEV__) console.log('📌 setPaperTurnState()') // a better name perhaps?

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
      console.warn('error: setTurnLocalState', e)
      Sentry.captureException(e, { tags: { pp_action: 'STLS_0' } })
      // Do not throw error. UI is not ready for it.
    }
  }

  async getTurnLocalState() {
    if (__DEV__) console.log('📌 getPaperTurnState()')
    const storedTurn = await AsyncStorage.getItem('turn')
    const turnState = JSON.parse(storedTurn) || {
      current: null, // String - current paper on the screen (id)
      passed: [], // [String] - papers passed
      guessed: [], // [String] - papers guessed
      sorted: [], // [Number] - papers guessed/passed sorted chronologically
      wordsLeft: this.state.game.round.wordsLeft, // [String] - words left
      // For analytics purposes only
      toggled_to_yes: 0,
      toggled_to_no: 0,
      revealed: 0,
    }
    return turnState
  }

  async _removeGameFromState() {
    if (__DEV__) console.log('📌 _removeGameFromState()')

    // Don't add try catch. If this fails, its critical,
    // so it's better to show the ErrorRecovery page... i guess.
    this.PapersAPI.setTurnLocalState(null)
    await this.PapersAPI.updateProfile({ gameId: null })
    this.setState(
      state => ({ game: null }),
      () => {
        this.config = {}
      }
    )
  }

  async leaveGame(opts = {}) {
    if (__DEV__) console.log('📌 leaveGame()', opts)

    try {
      const game = this.state.game
      await this.state.socket.leaveGame(opts)

      if (!opts.wasKicked || !opts.gameDeleted) {
        let gameStatus
        if (!game.teams) {
          gameStatus = 'new'
        } else if (!game.round) {
          gameStatus = 'writing'
        } else {
          const roundNr = game.round.current
          gameStatus =
            roundNr === 2 && game.round.status === 'finished' ? 'finished' : `round_${roundNr}`
        }
        Analytics.logEvent('game_leave', { status: gameStatus })
      }
    } catch (e) {
      this._removeGameFromState()
      console.warn('error: leaveGame', e)
      Sentry.captureException(e, { tags: { pp_action: 'LVG_0' } })
    }
  }

  async abortGameGate() {
    try {
      await this.state.socket.leaveGame()
    } catch (e) {}
    this._removeGameFromState()
  }

  async removePlayer(playerId) {
    if (__DEV__) console.log('📌 removePlayer()')
    try {
      await this.state.socket.removePlayer(playerId)
      Analytics.logEvent('remove_player')
    } catch (e) {
      console.warn('error: removePlayer', e)
      Sentry.captureException(e, { tags: { pp_action: 'RMP_0' } })
    }
  }

  async deleteGame() {
    for (const playerId in this.state.game.players) {
      if (playerId !== this.state.profile.id) {
        await this.state.socket.removePlayer(playerId)
      }
    }
    Analytics.logEvent('game_delete')
    await this.leaveGame({ gameDeleted: true })
  }

  soundToggleStatus() {
    const newStatus = !this.state.profile.settings.sound
    PapersSound.setSoundStatus(newStatus)
    this.updateProfileSettings('sound', newStatus)
  }

  soundPlay(soundId) {
    PapersSound.play(soundId)
  }

  motionToggle() {
    const newStatus = !this.state.profile.settings.motion
    this.updateProfileSettings('motion', newStatus)
  }

  sendTracker(trackName, opts) {
    switch (trackName) {
      case 'game_finishRound': {
        const game = this.state.game
        const totalScore = opts.arrayOfScores.reduce((acc, cur) => acc + cur, 0)
        const isFinalRound = game.round.current === game.settings.roundsCount - 1

        Analytics.logEvent(`game_finishRound_${game.round.current + 1}`, {
          players: Object.keys(game.players).length,
          turns: game.round.turnCount,
          duration: Math.round((Date.now() - this.config.roundDuration) / 60000) || 0, // in minutes
          score: opts.arrayOfScores.join('-'),
        })
        this.config.roundDuration = undefined

        if (totalScore !== Object.keys(game.players).length * 10) {
          console.warn('Wrong score!!', totalScore, this.state.profile.id, game)
          Sentry.withScope(scope => {
            scope.setExtra('response', JSON.stringify(game))
            Sentry.captureException(Error('Wrong score!'))
          })
        }

        if (isFinalRound) {
          const statUpdate = opts.isMyTeamWinner ? 'gamesWon' : 'gamesLost'
          this.updateProfileStats(statUpdate, 1)
          this.updateProfileStats('papersGuessed', opts.myTotalScore)
        }

        break
      }
      default:
        break
    }
  }
}

PapersContextProvider.propTypes = {
  initialProfile: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
    gameId: PropTypes.string,
    settings: PropTypes.shape({
      sound: PropTypes.bool,
      motions: PropTypes.bool,
    }),
    stats: PropTypes.shape({
      gamesCreated: 0,
      gamesJoined: 0,
      gamesWon: 0,
      gamesLost: 0,
      papersGuessed: 0,
    }),
  }),
  children: PropTypes.node,
}

export default PapersContext
