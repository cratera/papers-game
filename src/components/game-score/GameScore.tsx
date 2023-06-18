import React from 'react'
import { View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import { formatScores } from '@src/store/papersMethods'

import { TeamId } from '@src/store/PapersContext.types'
import CardScore from './CardScore'
import { CardScoreProps } from './CardScore.types'
import { GameScoreProps } from './GameScore.types'

const GameScore = ({ BOAT = false, ...props }: GameScoreProps) => {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const round = game?.round
  const roundIx = round?.current

  const { scoreByRound, scoreTotal, isTie, getPlayersSorted, sortTeamsByScore } = React.useMemo(
    () => formatScores(game?.score, game?.teams, profile?.id),
    [game, profile]
  )

  return roundIx ? (
    <View {...props}>
      {scoreByRound[roundIx]?.arrayOfTeamsId?.sort(sortTeamsByScore).map((id, index) => {
        const teamId = Number(id) as TeamId
        const playersSorted = getPlayersSorted(teamId, roundIx, BOAT)

        return (
          <CardScore
            key={teamId}
            index={index as CardScoreProps['index']}
            isTie={isTie}
            teamName={game?.teams ? game.teams[teamId].name : ''}
            playersSorted={playersSorted}
            scoreTotal={scoreTotal[teamId]}
            scoreRound={scoreByRound[roundIx]?.teamsScore[teamId] || 0}
          />
        )
      })}
    </View>
  ) : null
}

export default GameScore
