import { PropsWithChildren } from 'react'
import init from './Firebase'
import { PapersContextProvider } from './PapersContext'

export type Profile = {
  id: string
  name: string
  avatar: string
  /**
   * The last game accessed by the user.
   */
  gameId: Maybe<Game['id']>
  /**
   * Whether the user is away from keyboard.
   */
  isAfk: boolean
  settings: {
    /**
     * Whether the user wants to have sound enabled.
     */
    sound: boolean
    /**
     * Whether the user wants to have motion enabled.
     */
    motion: boolean
  }
  stats: {
    gamesCreated: number
    gamesJoined: number
    gamesWon: number
    gamesLost: number
    papersGuessed: number
  }
}

export type PlayerState = {
  /**
   * Whether the player is away from keyboard.
   */
  isAfk: Profile['isAfk']
  /**
   * Whether the player is ready to start the game or the next round.
   */
  isReady: boolean
}

export type TeamId = 0 | 1

export type Team = {
  id: TeamId
  name: string
  players: Profile['id'][]
}

export type Round = {
  current: 0 | 1 | 2
  status: number | 'getReady' | 'finished' // TODO: why is this a number when the game is being played?
  turnCount: number
  wordsLeft: number[]
  turnWho: {
    team: TeamId
    /**
     * The key is the id of the team. The value is the index of the team player that is currently playing.
     */
    0: number
    /**
     * The key is the id of the team. The value is the index of the team player that is currently playing.
     */
    1: number
  }
}

export type Score = Record<Profile['id'], number[]>

export type GameTeams = Record<Round['turnWho']['team'], Team>

export type Words = Record<Profile['id'], number[]> & { _all: string[] }

export type GameSettings = {
  /**
   * The number of rounds in the game.
   */
  roundsCount: number
  /**
   * The time in milliseconds of each round.
   */
  time_ms: number[]
  /**
   * The number of words each player has to write.
   */
  words: number
}

export type Game = {
  /**
   * The name of the game.
   * Used to join the game.
   */
  name: string
  /**
   * The code of the game.
   * Used to join the game.
   */
  code: string
  /**
   * The id of the game.
   * Generated by combining the name and the code.
   *
   * Example: `test_9999` if the name is `test` and the code is `9999`.
   */
  id: string
  /**
   * The id of the player that created the game and controls its flow.
   */
  creatorId: Profile['id']
  hasStarted: boolean
  papersGuessed: number
  /**
   * The keys are the ids of the players and the values are their state.
   */
  players: Record<Profile['id'], PlayerState>
  round: Maybe<Round>
  /**
   * The score of the game for each round.
   * The keys of each round are the ids of the players and the values are the indexes of the words they guessed.
   */
  score: Maybe<Record<Round['current'], Score>>
  settings: GameSettings
  /**
   * The teams of the game.
   */
  teams: Maybe<GameTeams>
  /**
   * The words every player wrote.
   * The `_all` key contains all the words of the game.
   * The other keys are the player ids and contais the indexes of the words in the `_all` key that the player wrote.
   */
  words: Maybe<Words>
}

export type Turn = {
  /**
   * Current paper id on the screen.
   */
  current: number
  /**
   * The id of the papers that were skipped.
   */
  passed: number[] // [String] - papers passed
  /**
   * The id of the papers that were succesfully guessed.
   */
  guessed: number[] // [String] - papers guessed
  /**
   * The id of the papers that were guessed/passed sorted chronologically.
   */
  sorted: []
  /**
   * The id of the papers that are left to be guessed.
   */
  wordsLeft: Round['wordsLeft'] // [String] - words left

  // For analytics purposes only
  toggled_to_yes: number
  toggled_to_no: number
  revealed: number
}

export type About = {
  /**
   * Installed version of the game.
   */
  version: string
  /**
   * `OTA` (Over The Air) update version.
   */
  ota: string
}

type State = {
  profile: Maybe<Profile>
  game: Maybe<Game>
  profiles: Maybe<Record<Profile['id'], Pick<Profile, 'id' | 'name' | 'avatar' | 'isAfk'>>>
  about: Maybe<About>
}

export type Config = {
  myTeamId: Maybe<Team['id']>
  roundDuration: Maybe<number>
}

export type PapersAPIMethods = Pick<
  (typeof PapersContextProvider)['prototype'],
  | 'updateProfile'
  | 'resetProfile'
  | 'updateProfileSettings'
  | 'resetProfileSettings'
  | 'resetProfileStats'
  | 'accessGame'
  | 'leaveGame'
  | 'abortGameGate'
  | 'removePlayer'
  | 'setTeams'
  | 'setWords'
  | 'setWordsForEveryone'
  | 'markMeAsReady'
  | 'markMeAsReadyForNextRound'
  | 'pingReadyStatus'
  | 'startTurn'
  | 'skipTurn'
  | 'getNextTurn'
  | 'finishTurn'
  | 'getTurnLocalState'
  | 'setTurnLocalState'
  | 'deleteGame'
  | 'soundToggleStatus'
  | 'soundPlay'
  | 'motionToggle'
  | 'sendTracker'
>

export interface PapersContextValue extends PapersAPIMethods {
  state: State
}

export interface PapersContextState extends State {
  socket: Maybe<ReturnType<typeof init>>
}

export type PapersContextProps = PropsWithChildren<{
  initialProfile: Profile
}>
