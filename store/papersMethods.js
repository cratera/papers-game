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
