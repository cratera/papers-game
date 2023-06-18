import { Game, GameTeams, Profile, Round, Score, TeamId } from './PapersContext.types'

/**
 * A util to know who is the next one to play.
 *
 * @example
 * getNextTurn({ team:0, 0:0, 1:0 }, teams)
 * // returns { team:1, 0:0, 1:1 }
 * @example
 * getNextTurn({ team:1, 0:0, 1:1 }, teams)
 * // returns { team:0, 0:1, 1:1 }
 */
export function getNextTurn(turnWho: Round['turnWho'], teams: GameTeams) {
  const { team, ...teamWho } = turnWho

  const nextTeam: Round['turnWho']['team'] = team === 0 ? 1 : 0
  const playersCount = teams[nextTeam].players.length
  const player = teamWho[nextTeam]
  const nextPlayer = player + 1 >= playersCount ? 0 : player + 1

  return {
    ...turnWho,
    team: nextTeam,
    [nextTeam]: nextPlayer,
  }
}

/**
 * A util to know who is the next one to play within the same team.
 *
 * @example
 * getNextTurn({ team:0, 0:0, 1:0 }, teams)
 * // returns { team:0, 0:1, 1:0 }
 * @example
 * getNextTurn({ team:1, 0:0, 1:1 }, teams)
 * // returns { team:1, 0:1, 1:2 }
 */
export function getNextSkippedTurn(turnWho: Round['turnWho'], teams: GameTeams) {
  if (!teams) {
    console.log('')
  }
  const { team, ...teamWho } = turnWho

  const playersCount = teams[team].players.length
  const player = teamWho[team]
  const nextPlayer = player + 1 >= playersCount ? 0 : player + 1

  return {
    ...turnWho,
    team,
    [team]: nextPlayer,
  }
}

// -------------------------------------------------------------

/**
 * Get readable info about the game score so far.
 * Use this with useMemo to avoid extra calculations.
 *
 * @example
 * const scores = React.useMemo(() => formatScores(...), [])
 */
export function formatScores(
  gameScore: Game['score'],
  gameTeams: Game['teams'],
  profileId: Maybe<Profile['id']>
) {
  const scoreTotal: Record<string, number> = {}
  let myTeamId: Maybe<Round['turnWho']['team']>

  const scoreByRound = [...Array(3)].map((_, i) => {
    const roundIx = i as Round['current']

    if (!gameScore) {
      return
    }

    const teamsPlayersScore = {} as Record<TeamId, { id: string; score: number }[]>
    const playersScore: Score = gameScore[roundIx]
    const teamsScore = {} as Record<TeamId, number>
    let bestPlayer: {
      id: string
      score: number
    } = {
      id: '',
      score: 0,
    }

    if (playersScore && gameTeams) {
      Object.keys(gameTeams).forEach((_, i) => {
        const teamId = i as Round['turnWho']['team']

        gameTeams[teamId].players.forEach((playerId) => {
          if (!myTeamId) {
            myTeamId = playerId === profileId ? teamId : null
          }
          const playerScore = playersScore[playerId] ? playersScore[playerId].length : 0
          if (playerScore > (bestPlayer.score || 0)) {
            bestPlayer = {
              id: playerId,
              score: playerScore,
            }
          }

          teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore

          if (!teamsPlayersScore[teamId]) {
            teamsPlayersScore[teamId] = []
          }

          teamsPlayersScore[teamId].push({
            id: playerId,
            score: playerScore,
          })
        })

        scoreTotal[teamId] = (scoreTotal[teamId] || 0) + teamsScore[teamId]
      })
    }

    const arrayOfScores = Object.values(teamsScore)
    const arrayOfTeamsId = Object.keys(teamsScore)

    return {
      arrayOfScores,
      arrayOfTeamsId,
      bestPlayer,
      teamsScore,
      teamsPlayersScore,
    }
  })

  type Player = {
    score: number
  }

  const sortByScore = (p1: Player, p2: Player) => p2.score - p1.score

  function getPlayersSorted(teamId: TeamId, roundIx: number, BOAT: boolean) {
    let playersScore = [] as { id: string; score: number }[]

    if (BOAT) {
      const playersTotalScore: Record<Profile['id'], number> = {}

      scoreByRound?.forEach((round) => {
        round?.teamsPlayersScore &&
          round.teamsPlayersScore[teamId].forEach((player) => {
            if (!playersTotalScore[player.id]) {
              playersTotalScore[player.id] = 0
            }
            playersTotalScore[player.id] += player.score
          })
      })

      playersScore = Object.entries(playersTotalScore).map(([id, score]) => ({ id, score }))
    } else {
      playersScore = scoreByRound[roundIx]?.teamsPlayersScore[teamId] || []
    }

    const playersSorted = playersScore.sort(sortByScore)
    return playersSorted
  }

  const arrayOfScores = Object.values(scoreTotal)
  const arrayOfTeamsId = Object.keys(scoreTotal)
  const winnerScore = Math.max(...arrayOfScores)
  const winnerIndex = arrayOfScores.indexOf(winnerScore)
  const isMyTeamWinner = myTeamId === Number(arrayOfTeamsId[winnerIndex])
  const isTie = arrayOfScores[1] === arrayOfScores[0]

  const sortTeamsByScore = (teamAId: string, teamBId: string) =>
    arrayOfScores[Number(teamBId)] - arrayOfScores[Number(teamAId)]

  return {
    scoreByRound,
    scoreTotal,
    isMyTeamWinner,
    isTie,
    sortTeamsByScore,
    getPlayersSorted,
  }
}

// -------------------------------------------------------------

export function getTeamId(playerId: Profile['id'], teams: Game['teams']) {
  let theTeamId: TeamId = 0

  for (const id in teams) {
    const teamId = Number(id) as TeamId

    const isOnTeam = teams[teamId].players.some((pId: Profile['id']) => pId === playerId)
    if (isOnTeam) {
      theTeamId = teamId
      break
    }
  }

  return theTeamId
}
