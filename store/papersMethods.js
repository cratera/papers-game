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
    const scorePlayers = gameScore ? gameScore[roundIx] : null
    const teamsScore = {}
    let bestPlayer = {}

    if (scorePlayers) {
      Object.keys(gameTeams).forEach(teamId => {
        gameTeams[teamId].players.forEach(playerId => {
          if (!myTeamId) {
            myTeamId = playerId === profileId ? teamId : null
          }
          const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0
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

  function getBestPlayer(teamId, roundIx, BOAT) {
    if (BOAT) {
      // best player of all rounds
      const playersTotalScore = {}
      scoreByRound.forEach(round => {
        round.teamsPlayersScore[teamId].forEach(player => {
          if (!playersTotalScore[player.id]) {
            playersTotalScore[player.id] = 0
          }
          playersTotalScore[player.id] += player.score
        })
      })
      const pTotalScoreArray = Object.keys(playersTotalScore)
      const highestScore = Math.max(...pTotalScoreArray.map(id => playersTotalScore[id]))
      const bestPlayerId = pTotalScoreArray.find(id => playersTotalScore[id] === highestScore)
      return { id: bestPlayerId, score: highestScore }
    }
    // best player of this round only
    const playersScore = scoreByRound[roundIx].teamsPlayersScore[teamId]
    const highestScore = Math.max(...playersScore.map(p => p.score))
    return playersScore.find(p => p.score === highestScore)
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
    getBestPlayer,
  }
}
