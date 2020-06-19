import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import { useScores } from '@store/papersMethods'

import CardScore from './CardScore.js'

const GameScore = ({ BOAT, style }) => {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const round = game.round
  const roundIx = round.current
  const { scoreByRound, scoreTotal, isTie, getBestPlayer, sortTeamsByScore } = React.useMemo(
    () => useScores(game.score, game.teams, profile.id),
    []
  )

  // TODO bug "arrayOfTeamsId" sometimes is empty
  // TODO bug, sometimes the numbers don't match an it can happen a number being submitted by mistake.
  // dunno how that happened, but it did.
  return (
    <View style={style}>
      {scoreByRound[roundIx].arrayOfTeamsId.sort(sortTeamsByScore).map((teamId, index) => {
        const bestPlayer = getBestPlayer(teamId, roundIx, BOAT)
        return (
          <CardScore
            key={teamId}
            index={index}
            isTie={isTie}
            teamName={game.teams[teamId].name}
            bestPlayer={{
              name: profiles[bestPlayer.id]?.name || '???',
              score: bestPlayer.score,
            }}
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
