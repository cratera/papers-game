// Isolated methods, to be easier to test.

/**
 * A util to know who is the next one to play.
 * @param {Object} turnWho
 * @param {String} turnWho.team The current teamId playing
 * @param {String} turnWho[team] The current/most recent player of that team playing 

 * @param {Object} teams An object with teams (their ids).
 * @param {String[]} teams[team].players List of team's players (String)
 * 
 * @example
 * // returns { team:1, 0:0, 1:1 }
 * getNextTurn({ team:0, 0:0, 1:0 }, teams)
* @example
 * // returns { team:0, 0:1, 1:1 }
 * getNextTurn({ team:1, 0:0, 1:1 }, teams)
 * @returns {Object} the turnWho state.
 */
export function getNextTurn(turnWho, teams) {
  const { team, ...teamWho } = turnWho
  const teamsCount = Object.keys(teams).length

  const nextTeam = team + 1 >= teamsCount ? 0 : team + 1
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
 * @param {Object} turnWho
 * @param {String} turnWho.team The current teamId playing
 * @param {String} turnWho[teamId] The current/most recent player of that team playing 

 * @param {Object} teams An object with teams (their ids).
 * @param {String[]} teams[teamId].players List of team's players (String)
 * 
 * @example
 * // returns { team:1, 0:0, 1:1 }
 * getNextTurn({ team:0, 0:0, 1:0 }, teams)
* @example
 * // returns { team:0, 0:1, 1:1 }
 * getNextTurn({ team:1, 0:0, 1:1 }, teams)
 * @returns {Object} the turnWho state.
 */
export function getNextSkippedTurn(turnWho, teams) {
  const { team, ...teamWho } = turnWho

  const playersCount = teams[team].players.length
  const player = teamWho[team]
  const nextPlayer = player + 1 >= playersCount ? 0 : player + 1

  return {
    ...turnWho,
    team: team,
    [team]: nextPlayer,
  }
}

// -------------------------------------------------------------

/**
 * Get readable info about the game score so far.
 * Use this with useMemo to avoid extra calculations.
 *
 * @example
 * const scores = React.useMemo(() => useScores(...), [])
 */
export function useScores(gameScore, gameTeams, profileId) {
  // This is not the best thing ever, but.... it works.
  const scoreTotal = {}
  let myTeamId = null

  const scoreByRound = [1, 2, 3].map((x, roundIx) => {
    const teamsPlayersScore = {}
    const playersScore = gameScore ? gameScore[roundIx] : null
    const teamsScore = {}
    let bestPlayer = {}

    if (playersScore) {
      Object.keys(gameTeams).forEach(teamId => {
        gameTeams[teamId].players.forEach(playerId => {
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
    // const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
    // const winnerId = arrayOfTeamsId[winnerIndex];

    return {
      arrayOfScores,
      arrayOfTeamsId,
      bestPlayer,
      teamsScore,
      teamsPlayersScore,
    }
  })

  const sortByScore = (p1, p2) => p2.score - p1.score

  function getPlayersSorted(teamId, roundIx, BOAT) {
    let playersScore

    if (BOAT) {
      const playersTotalScore = {}
      scoreByRound.forEach(round => {
        round.teamsPlayersScore[teamId].forEach(player => {
          if (!playersTotalScore[player.id]) {
            playersTotalScore[player.id] = 0
          }
          playersTotalScore[player.id] += player.score
        })
      })

      playersScore = Object.entries(playersTotalScore).map(([id, score]) => ({ id, score }))
    } else {
      playersScore = scoreByRound[roundIx].teamsPlayersScore[teamId] || []
    }

    const playersSorted = playersScore.sort(sortByScore)
    return playersSorted
  }

  const arrayOfScores = Object.values(scoreTotal)
  const arrayOfTeamsId = Object.keys(scoreTotal)
  const winnerScore = Math.max(...arrayOfScores)
  const winnerIndex = arrayOfScores.indexOf(winnerScore)
  const isMyTeamWinner = myTeamId === arrayOfTeamsId[winnerIndex]
  const isTie = arrayOfScores[1] === arrayOfScores[0]

  const sortTeamsByScore = (teamAId, teamBId) => arrayOfScores[teamBId] - arrayOfScores[teamAId]

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

export function getTeamId(playerId, teams) {
  let theTeamId

  for (const teamId in teams) {
    const isOnTeam = teams[teamId].players.some(pId => pId === playerId)
    if (isOnTeam) {
      theTeamId = teamId
      break
    }
  }

  return theTeamId
}
