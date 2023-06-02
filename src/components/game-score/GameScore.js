import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'

import PapersContext from '@src/store/PapersContext.js'
import { formatScores } from '@src/store/papersMethods'

import CardScore from './CardScore.js'

const GameScore = ({ BOAT, style }) => {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const round = game.round
  const roundIx = round.current
  const { scoreByRound, scoreTotal, isTie, getPlayersSorted, sortTeamsByScore } = React.useMemo(
    () => formatScores(game.score, game.teams, profile.id),
    [game.score, game.teams, profile.id]
  )

  return (
    <View style={style}>
      {scoreByRound[roundIx].arrayOfTeamsId.sort(sortTeamsByScore).map((teamId, index) => {
        const playersSorted = getPlayersSorted(teamId, roundIx, BOAT)
        return (
          <CardScore
            key={teamId}
            index={index}
            isTie={isTie}
            teamName={game.teams[teamId].name}
            playersSorted={playersSorted}
            scoreTotal={scoreTotal[teamId]}
            scoreRound={scoreByRound[roundIx].teamsScore[teamId]}
          />
        )
      })}
    </View>
  )
}

GameScore.propTypes = {
  /* best player of all times (all rounds) */
  BOAT: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}

export default GameScore
