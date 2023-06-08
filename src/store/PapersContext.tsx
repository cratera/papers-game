import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { Component } from 'react'

import * as Sentry from '@src/services/sentry'
import { isWeb } from '@src/utils/device'

import { getNextSkippedTurn, getNextTurn } from './papersMethods'
import * as PapersSound from './PapersSound'
import wordsForEveryone from './wordsForEveryone'

import { analytics as Analytics } from '@src/services/firebase'
import serverInit from './Firebase'
import {
  Config,
  Game,
  GameTeams,
  PapersAPIMethods,
  PapersContextProps,
  PapersContextState,
  PapersContextValue,
  Profile,
  Round,
  Team,
  Turn,
  Words,
} from './PapersContext.types'
import { SoundName } from './PapersSound.types'

const i18nUnexpectedError = 'Unexpected error. Please try again later.'

const PapersContext = React.createContext<PapersContextValue>({
  state: {
    profile: null,
    game: null,
    profiles: null,
    about: null,
  },
  ...({} as PapersAPIMethods),
})

const settingsDefaults = {
  sound: !__DEV__,
  motion: !isWeb,
} satisfies Profile['settings']

const statsDefaults = {
  // NOTE: If you change this, don't forget Statistics.js
  gamesCreated: 0,
  gamesJoined: 0,
  gamesWon: 0,
  gamesLost: 0,
  papersGuessed: 0,
} satisfies Profile['stats']

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
    settings: settingsStored ? JSON.parse(settingsStored) : settingsDefaults,
    stats: statsStored ? JSON.parse(statsStored) : statsDefaults,
  }
}

export class PapersContextProvider extends Component<PapersContextProps, PapersContextState> {
  config: Config
  PapersAPI: PapersAPIMethods

  constructor(props: PapersContextProps) {
    super(props)

    // TODO: save this on localStorage. Update: Why? lol
    this.config = {
      myTeamId: null,
      roundDuration: null,
    }

    this.state = {
      socket: null, // rename to serverAPI?
      profile: {
        id: this.props.initialProfile.id,
        name: this.props.initialProfile.name,
        avatar: this.props.initialProfile.avatar,
        gameId: this.props.initialProfile.gameId,
        settings: this.props.initialProfile.settings,
        stats: this.props.initialProfile.stats,
        isAfk: false,
      },
      game: null,
      profiles: null,
      about: {
        version: '0.3.2',
        ota: '00',
      },
    }

    this._removeGameFromState = this._removeGameFromState.bind(this)
    this._subscribeGame = this._subscribeGame.bind(this)

    // ==== Papers API ==== //
    this.PapersAPI = {
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
      setWordsForEveryone: this.setWordsForEveryone.bind(this),

      markMeAsReady: this.markMeAsReady.bind(this),
      markMeAsReadyForNextRound: this.markMeAsReadyForNextRound.bind(this),
      pingReadyStatus: this.pingReadyStatus.bind(this),

      startTurn: this.startTurn.bind(this),
      skipTurn: this.skipTurn.bind(this),
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
    const profile = this.state.profile
    console.log('Papers mounted:', profile)
    await this.tryToReconnect()

    await PapersSound.init(profile?.settings.sound)
  }

  componentWillUnmount() {
    this.state.socket && this.state.socket?.offAll()

    if (__DEV__)
      console.log(`
::::::::::::::::::::::::::::::
    ... Refreshing app ...
::::::::::::::::::::::::::::::
        `)
  }

  render() {
    return (
      <PapersContext.Provider
        value={{
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

  // ==== Papers API ==== //

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
      if (!this.state.profile) {
        if (__DEV__) console.log(':: no profile')
        return
      }

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

  initAndSign(cb: (error?: string) => void) {
    if (__DEV__) console.log('📌 initAndSign()')
    if (!this.state.profile) {
      if (__DEV__) console.log(':: no profile')
      return
    }

    const { name, avatar } = this.state.profile

    if (!name) {
      // TODO: Review all of these edge cases.
      Sentry.captureMessage(`initAndSign: Missing name! ${JSON.stringify(this.state.profile)}`)
      cb('missing_name') // TODO: convert to Error.
      return
    }

    const socket = this.init()

    socket?.on('profile.signed', async (_, id) => {
      if (__DEV__) console.log('📌 on.profile.signed', id)
      await this.PapersAPI.updateProfile({ id }, { ignoreSocket: true })
      cb()
    })

    socket?.signIn({ name, avatar }, (error) => {
      if (error) {
        Sentry.captureMessage(`socket.signIn: error ${JSON.stringify(error)}`)
      }
    })
  }

  async accessGame(
    variant: 'join' | 'create',
    /**
     * It should be the game id if the variant is `join` and the game name if the variant is `create`
     */
    gameIdName: Game['id'] | Game['name'],
    cb: (gameId: Maybe<Game['id']>, errorMsg?: string, opts?: { isUnexError: boolean }) => void,
    opts: {
      automatic: boolean
    } = {
      automatic: false,
    }
  ) {
    if (!this.state.socket || !this.state.profile?.id) {
      if (__DEV__) console.log('📌 accessGame() - init needed first')

      this.initAndSign((errorMsg) => {
        if (errorMsg) {
          this._removeGameFromState()
          return cb(null, errorMsg)
        }
        this.accessGame(variant, gameIdName, cb, opts)
      })
      return
    }

    if (__DEV__) console.log('📌 accessGame()', variant, gameIdName)

    if (!gameIdName) {
      return cb(null, 'Missing game name')
    }

    if (!variant || ['join', 'create'].indexOf(variant) < 0) {
      return cb(null, `variant incorrect - ${variant}`)
    }

    // createGame | joinGame
    try {
      const gameId = await this.state.socket[`${variant}Game`](gameIdName)
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
      type ErrorMsg = keyof typeof errorMsgMap
      let message: ErrorMsg = 'ups'

      if (e instanceof Error) {
        message = e.message as ErrorMsg
      }

      const errorMsgMap = {
        notSigned: () => 'Cannot find your profile. Please start over.', // I hope this never happens.
        exists: () => 'Choose another name.', // 0.001% probability because code is random.
        notFound: () => `Wrong code for ${gameIdName.split('_')[0]}.`,
        alreadyStarted: () => 'That game already started.',
        ups: () => i18nUnexpectedError,
      }

      const errorMsg = errorMsgMap[message]() as string
      const isUnexError = !errorMsgMap[message]

      if (isUnexError) {
        console.warn(':: accessGame failed!', variant, gameIdName, e, errorMsg)
        Sentry.captureException(e, { tags: { pp_action: 'AG_0' } })
      }
      await this._removeGameFromState()
      return cb(null, errorMsg, { isUnexError })
    }
  }

  _subscribeGame(gameId: Game['id']) {
    if (__DEV__) console.log('📌 _subscribeGame', gameId)

    const socket = this.state.socket

    const setGame = (cb: (game: Game) => Partial<Game>, afterUpdate?: EmptyCallback) => {
      this.setState((state) => {
        if (!state.game) return null
        return {
          game: {
            ...state.game,
            ...cb(state.game),
          },
        }
      }, afterUpdate)
    }

    socket?.on('game.set', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data.game)
      const { game, profiles } = data
      this.setState({ game, profiles })

      if (!game.hasStarted) {
        // Prevent possible memory leaks from an old game.
        this.config = {
          myTeamId: null,
          roundDuration: null,
        }
        this.PapersAPI.setTurnLocalState(null)
      }
    })

    socket?.on('game.players.added', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { id, info, profile } = data

      setGame((game) => ({
        players: {
          ...game.players,
          [id]: info,
        },
      }))

      this.setState((state) => ({
        profiles: {
          ...state.profiles,
          [id]: profile,
        },
      }))
    })

    socket?.on('game.players.removed', async (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { id: playerId /*, newAdmin */ } = data

      if (playerId === this.state.profile?.id) {
        await this.leaveGame({ wasKicked: true })
        return
      }

      setGame((game) => {
        const otherPlayers = Object.keys(game.players).reduce((acc, p) => {
          return p === playerId ? acc : { ...acc, [p]: game.players[p] }
        }, {})

        return {
          // admin: newAdmin, // TODO:
          players: otherPlayers,
        }
      })
    })

    socket?.on('game.players.changed', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { id, info } = data

      setGame((game) => ({
        players: {
          ...game.players,
          [id]: {
            ...(game.players[id] || {}),
            ...info,
          },
        },
      }))
    })

    socket?.on('game.teams.set', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const teams = data
      setGame(
        () => ({
          teams,
        }),
        () => this._storeMyTeam()
      )
    })

    socket?.on('game.words.set', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const { pId, words } = data // pId can be '_all' too.

      setGame((game) => ({
        words: {
          ...game.words,
          [pId]: words,
        } as Game['words'],
      }))
    })

    socket?.on('game.hasStarted', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`, data)
      const hasStarted = data
      if (hasStarted) {
        // REVIEW - This is called on page refresh. it shouldn't happen.
        Analytics.logEvent('game_started', {
          players: Object.keys(this.state.game?.players || {}).length,
        })
      }
      setGame(() => ({
        hasStarted,
      }))
    })

    socket?.on('game.round', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const round = data

      setGame(() => ({
        round,
      }))
    })

    socket?.on('game.score', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const score = data

      setGame(() => ({
        score,
      }))
    })

    socket?.on('game.papersGuessed', (topic, data) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      const papersGuessed = data // Number

      setGame(() => ({
        papersGuessed,
      }))
    })

    socket?.on('game.leave', (topic) => {
      if (__DEV__) console.log(`:: on.${topic}`)
      this._removeGameFromState()
    })
  }

  async updateProfile(
    profile: Partial<PapersContextState['profile']>,
    opts: {
      ignoreSocket: boolean
    } = { ignoreSocket: false }
  ) {
    if (__DEV__) console.log('📌 updateProfile()', profile, opts)
    const mapKeys = {
      id: 'profile_id',
      name: 'profile_name',
      avatar: 'profile_avatar',
      gameId: 'profile_gameId',
    }

    if (!profile) {
      console.warn('updateProfile: profile is empty')
      return
    }

    try {
      for (const key in profile) {
        const typedKey = key as keyof PapersContextValue['state']['profile']

        if (typeof profile[typedKey] === 'string') {
          await AsyncStorage.setItem(mapKeys[typedKey], profile[typedKey])
        } else {
          await AsyncStorage.removeItem(mapKeys[typedKey])
        }
      }
    } catch (e) {
      console.warn('error: updateProfile AS', e)
      Sentry.captureException(e, { tags: { pp_action: 'UP_0' } })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, gameId, ...serverProfile } = profile

    if (!opts.ignoreSocket && Object.keys(serverProfile).length > 0) {
      if (this.state.socket) {
        try {
          this.state.socket?.updateProfile(serverProfile)
        } catch (e) {
          console.warn('error: updateProfile socket', e)
          Sentry.captureException(e, { tags: { pp_action: 'UP_1' } })
          // throw Error(i18nUnexpectedError) // REVIEW later
        }
      }
    }

    this.setState((state) => ({
      profile: {
        ...(state.profile as Profile),
        ...profile,
      },
    }))
  }

  async updateProfileSettings(setting: keyof Profile['settings'], value: boolean) {
    if (__DEV__) console.log('📌 updateProfileSettings()', setting, value)

    this.setState(
      (state) => ({
        profile: {
          ...(state.profile as Profile),
          settings: {
            ...(state.profile?.settings as Profile['settings']),
            [setting]: value,
          },
        },
      }),
      async () => {
        const newSettings = this.state.profile?.settings
        try {
          await AsyncStorage.setItem('profile_settings', JSON.stringify(newSettings))
        } catch (e) {
          console.warn('error: updateProfileSettings', e)
          Sentry.captureException(e, { tags: { pp_action: 'UP_1' } })
        }
      }
    )
  }

  async updateProfileStats(statKey: keyof Profile['stats'], valueToAdd: number) {
    // Similar to updateProfileSettings. Could be DRY but it's ok...
    if (__DEV__) console.log('📌 updateProfileStats()', statKey, valueToAdd)

    this.setState(
      (state) => ({
        profile: {
          ...(state.profile as Profile),
          stats: {
            ...(state.profile?.stats as Profile['stats']),
            [statKey]: (state.profile?.stats ? state.profile.stats[statKey] : 0) + valueToAdd,
          },
        },
      }),
      async () => {
        const newStats = this.state.profile?.stats
        try {
          await AsyncStorage.setItem('profile_stats', JSON.stringify(newStats))
        } catch (e) {
          console.warn('error: updateProfileStats', e)
          Sentry.captureException(e, { tags: { pp_action: 'UPS_1' } })
        }
      }
    )
  }

  async resetProfile() {
    if (__DEV__) console.log('📌 resetProfile()')
    try {
      if (this.state.socket && this.state.profile) {
        await this.state.socket?.resetProfile(this.state.profile.id)
        this.state.socket?.offAll()
        this.setState((state) => ({
          ...state,
          socket: null,
        }))
      }

      await AsyncStorage.removeItem('profile_id')
      await AsyncStorage.removeItem('profile_name')
      await AsyncStorage.removeItem('profile_avatar')
      await AsyncStorage.removeItem('profile_gameId')

      this.setState((state) => ({
        ...(state as PapersContextState),
        profile: {
          ...(state.profile as Profile),
          id: '',
          name: '',
          avatar: '',
          gameId: '',
        },
      }))

      await this.resetProfileSettings()
      await this.resetProfileStats()
    } catch (e) {
      console.warn('error: resetProfile', e)
      Sentry.captureException(e, { tags: { pp_action: 'RP_0' } })
    }
  }

  async resetProfileSettings() {
    if (__DEV__) console.log('📌 resetProfileSettings()')
    try {
      await AsyncStorage.setItem('profile_settings', JSON.stringify(settingsDefaults))
    } catch (e) {
      console.warn('error: profile_settings', e)
      Sentry.captureException(e, { tags: { pp_action: 'RPSET_0' } })
    }

    this.setState((state) => ({
      profile: {
        ...(state.profile as Profile),
        settings: settingsDefaults,
      },
    }))
  }

  async resetProfileStats() {
    if (__DEV__) console.log('📌 resetProfileStats()')
    try {
      await AsyncStorage.setItem('profile_stats', JSON.stringify(statsDefaults))
    } catch (e) {
      console.warn('error: resetProfileStats', e)
      Sentry.captureException(e, { tags: { pp_action: 'RPSTA_0' } })
    }

    this.setState((state) => ({
      profile: {
        ...(state.profile as Profile),
        stats: statsDefaults,
      },
    }))
  }

  async setWords(words: string[]) {
    if (__DEV__) console.log('📌 setWords()')
    try {
      await this.state.socket?.setWords(words)
    } catch (e) {
      console.warn('error: setWords', e)
      Sentry.captureException(e, { tags: { pp_action: 'SW_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async setWordsForEveryone() {
    if (__DEV__) console.log('📌 setWordsForEveryone()')
    const allWords = Object.keys(this.state.game?.players || {}).reduce((acc, playerId, pIndex) => {
      return {
        ...acc,
        [playerId]: wordsForEveryone[pIndex].map((w, windex) => windex + pIndex * 10),
      }
    }, {} as Words)
    allWords._all = wordsForEveryone
      .slice(0, Object.keys(this.state.game?.players || {}).length)
      .flat()
    await this.state.socket?.setWordsForEveryone(allWords)
  }

  async setTeams(teams: GameTeams) {
    if (__DEV__) console.log('📌 setTeams()')
    try {
      await this.state.socket?.setTeams(teams)
      Analytics.logEvent('game_setTeams', {
        players: Object.keys(this.state.game?.players || {}).length,
      })
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
      wordsLeft: this.state.game?.words?._all?.map((_, i) => i) || [],
    } satisfies Game['round']

    try {
      this.PapersAPI.soundPlay('ready')
      await this.state.socket?.markMeAsReady(roundStatus, () => {
        this.state.socket?.startGame()
      })
      this.config.roundDuration = Date.now()
      Analytics.logEvent(`game_imReadyToRound_1`, {
        players: Object.keys(this.state.game?.players || {}).length,
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
      await this.state.socket?.markMeAsReadyForNextRound(() => {
        this._startNextRound()
      })

      this.config.roundDuration = Date.now()
      Analytics.logEvent(
        `game_imReadyToRound_${
          this.state.game?.round?.current ? this.state.game.round.current + 2 : 'unknown'
        }`,
        {
          players: Object.keys(this.state.game?.players || {}).length,
        }
      )
    } catch (e) {
      console.warn('error: markMeAsReadyForNextRound', e)
      Sentry.captureException(e, { tags: { pp_action: 'MMARNR_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  async pingReadyStatus() {
    if (__DEV__) console.log('📌 pingReadyStatus()')
    try {
      const isAllReady = await this.state.socket?.pingReadyStatus()

      if (!isAllReady) return

      if (!this.state.game?.hasStarted) {
        console.log(':: start game!')
        this.state.socket?.startGame()
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
      this.state.socket?.startTurn()
    } catch (e) {
      console.warn('error: startTurn', e)
      Sentry.captureException(e, { tags: { pp_action: 'STN_0' } })
      throw Error(i18nUnexpectedError)
    }
  }

  getNextTurn() {
    if (!this.state.game) {
      Sentry.captureMessage('getNextTurn() called before game is ready')
      return
    }

    const { teams, round } = this.state.game

    if (!round) {
      Sentry.captureMessage('getNextTurn() called before round is ready')
      return
    }

    if (!teams) {
      Sentry.captureMessage('getNextTurn() called before teams are ready')
      return
    }

    return getNextTurn(round.turnWho, teams)
  }

  async skipTurn(playerId: Profile['id']) {
    if (!this.state.game) {
      Sentry.captureMessage('skipTurn() called before game is ready')
      return
    }

    const { players, teams, round } = this.state.game

    if (players[playerId].isAfk === false) {
      Sentry.withScope((scope) => {
        scope.setExtra('response', JSON.stringify(this.state.game))
        Sentry.captureException(Error('Skip unneded!'))
      })
      return
    }

    if (!round) {
      Sentry.captureMessage('getNextSkippedTurn() called before round is ready')
      return
    }

    if (!teams) {
      Sentry.captureMessage('getNextSkippedTurn() called before teams are ready')
      return
    }

    const turnWho = getNextSkippedTurn(round.turnWho, teams)

    try {
      await this.state.socket?.skipTurn({
        roundStatus: {
          ...round,
          turnWho,
        },
      })
    } catch (e) {
      Sentry.withScope((scope) => {
        scope.setExtra('response', JSON.stringify(this.state.game))
        Sentry.captureException(e)
      })
    }
  }

  async finishTurn(papersTurn: Turn) {
    if (__DEV__) console.log('📌 finishTurn()')

    if (!this.state.profile) {
      Sentry.captureMessage('finishTurn() called before profile is ready')
      return
    }

    const profileId = this.state.profile.id

    const game = this.state.game

    if (!game) {
      Sentry.captureMessage('finishTurn() called before game is ready')
      return
    }

    const { round } = game

    if (!round) {
      Sentry.captureMessage('finishTurn() called before round is ready')
      return
    }

    const roundCurrent = round.current
    const current = papersTurn.current ? [papersTurn.current] : []
    const wordsLeft = [...papersTurn.wordsLeft, ...papersTurn.passed, ...current]
    const roundStatus: Round =
      wordsLeft.length > 0
        ? {
            current: roundCurrent,
            turnWho: this.getNextTurn() || ({} as Round['turnWho']),
            turnCount: round.turnCount + 1,
            status: 'getReady',
            wordsLeft,
          }
        : {
            current: roundCurrent,
            turnWho: {} as Round['turnWho'],
            turnCount: 0,
            status: 'finished',
            wordsLeft: [],
          }

    let wordsSoFar: number[] = []

    if (!game.score) {
      game.score = null
    } else {
      if (!game?.score[roundCurrent]) {
        game.score[roundCurrent] = {}

        wordsSoFar = game.score[roundCurrent][profileId]
      }
    }

    const allValidWordsGuessed = [...wordsSoFar, ...papersTurn.guessed].filter((word) => {
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
      if (!profileId) {
        Sentry.captureMessage('finishTurn() called before profile is ready')
        return
      }

      await this.state.socket?.finishTurn({
        playerScore: {
          [profileId]: uniqueWordsGuessed,
        },
        roundStatus,
      })

      if (!game.teams) {
        Sentry.captureMessage('finishTurn() called before teams are ready')
        return
      }

      if (!this.config?.myTeamId) {
        Sentry.captureMessage('finishTurn() called before myTeamId is ready')
        return
      }

      Analytics.logEvent('finish_turn', {
        round: roundCurrent + 1,
        turn: round.turnCount + 1,
        teamSize: game?.teams[this.config?.myTeamId]?.players.length || 0,
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
    const teams = this.state.game?.teams
    let myTeamId: Team['id'] = 0

    for (const id in teams) {
      const teamId = Number(id) as Team['id']

      const isMyTeam = teams[teamId].players.some((pId) => pId === this.state.profile?.id)
      if (isMyTeam) {
        myTeamId = Number(teamId) as Team['id']
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
    await this.state.socket?.setRound({
      current:
        typeof game?.round?.current === 'number'
          ? ((game.round.current + 1) as Round['current'])
          : 0,
      status: 'getReady',
      turnWho: this.getNextTurn() || ({} as Round['turnWho']),
      turnCount: 0,
      // all words by key to save space // dry across file
      wordsLeft: game?.words ? game.words._all.map((_, i) => i) : [],
    })
  }

  async setTurnLocalState(turn: Maybe<Turn>) {
    if (__DEV__) console.log('📌 setPaperTurnState()') // a better name perhaps?

    try {
      if (turn) {
        await AsyncStorage.setItem('turn', JSON.stringify(turn))
        const papersGuessed = turn.guessed.length

        if (papersGuessed !== this.state.game?.papersGuessed) {
          // Send this, so all players know N papers were guessed so far.
          this.state.socket?.setPapersGuessed(papersGuessed)
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
    const turnState = storedTurn
      ? JSON.parse(storedTurn)
      : ({
          current: 0,
          passed: [],
          guessed: [],
          sorted: [],
          wordsLeft: this.state.game?.round?.wordsLeft || [],
          // For analytics purposes only
          toggled_to_yes: 0,
          toggled_to_no: 0,
          revealed: 0,
        } satisfies Turn)
    return turnState
  }

  async _removeGameFromState() {
    if (__DEV__) console.log('📌 _removeGameFromState()')

    // Don't add try catch. If this fails, its critical,
    // so it's better to show the ErrorRecovery page... i guess.
    this.PapersAPI.setTurnLocalState(null)
    await this.PapersAPI.updateProfile({ gameId: null })
    this.setState(
      () => ({ game: null }),
      () => {
        this.config = {
          myTeamId: null,
          roundDuration: null,
        }
      }
    )
  }

  async leaveGame(opts: { wasKicked?: boolean; gameDeleted?: boolean } = {}) {
    if (__DEV__) console.log('📌 leaveGame()', opts)

    try {
      const game = this.state.game
      await this.state.socket?.leaveGame(opts)

      if (!opts.wasKicked || !opts.gameDeleted) {
        let gameStatus
        if (!game?.teams) {
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
      await this.state.socket?.leaveGame({})
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'ABG_0' } })
    }
    this._removeGameFromState()
  }

  async removePlayer(playerId: Profile['id']) {
    if (__DEV__) console.log('📌 removePlayer()')
    try {
      await this.state.socket?.removePlayer(playerId)
      Analytics.logEvent('remove_player')
    } catch (e) {
      console.warn('error: removePlayer', e)
      Sentry.captureException(e, { tags: { pp_action: 'RMP_0' } })
    }
  }

  async deleteGame() {
    for (const playerId in this.state.game?.players) {
      if (playerId !== this.state.profile?.id) {
        await this.state.socket?.removePlayer(playerId)
      }
    }
    Analytics.logEvent('game_delete')
    await this.leaveGame({ gameDeleted: true })
  }

  soundToggleStatus() {
    const newStatus = !this.state.profile?.settings.sound

    if (newStatus !== undefined) {
      PapersSound.setSoundStatus(newStatus)
      this.updateProfileSettings('sound', newStatus)
    }
  }

  soundPlay(soundId: SoundName) {
    PapersSound.play(soundId)
  }

  motionToggle() {
    const newStatus = !this.state.profile?.settings.motion

    if (newStatus !== undefined) {
      this.updateProfileSettings('motion', newStatus)
    }
  }

  sendTracker(
    trackName: 'game_finishRound',
    opts: { arrayOfScores: number[]; isMyTeamWinner: boolean; myTotalScore: number } = {
      arrayOfScores: [],
      isMyTeamWinner: false,
      myTotalScore: 0,
    }
  ) {
    switch (trackName) {
      case 'game_finishRound': {
        const game = this.state.game

        if (!game) {
          if (__DEV__) console.log('📌 sendTracker: game is undefined')
          return
        }

        const totalScore = opts.arrayOfScores.reduce((acc, cur) => acc + cur, 0)
        const isFinalRound = game?.round?.current === game?.settings?.roundsCount - 1

        Analytics.logEvent(
          `game_finishRound_${
            typeof game.round?.current === 'number' ? game.round.current + 1 : 'unknown'
          }`,
          {
            players: game?.players ? Object.keys(game?.players).length : 0,
            turns: game?.round?.turnCount,
            duration: this.config?.roundDuration
              ? Math.round((Date.now() - this.config.roundDuration) / 60000) // in minutes
              : 0,
            score: opts.arrayOfScores.join('-'),
          }
        )
        this.config.roundDuration = undefined

        if (totalScore !== Object.keys(game?.players || {}).length * 10) {
          console.warn('Wrong score!!', totalScore, this.state.profile?.id, game)
          Sentry.withScope((scope) => {
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

export default PapersContext
