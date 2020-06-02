import React, { Fragment } from 'react'
import { View, Text } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { useScores } from '@store/papersMethods'

import EmojiRain from './EmojiRain'
import GameScore from '@components/game-score'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const RoundScore = () => {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const round = game.round
  const roundIx = round.current
  const isFinalRound = roundIx === game.settings.roundsCount - 1
  const { isMyTeamWinner, isTie } = React.useMemo(
    () => useScores(game.score, game.teams, profile.id),
    []
  )

  function handleReadyClick() {
    Papers.markMeAsReadyForNextRound()
  }

  return (
    <Fragment>
      {!isTie && isFinalRound && <EmojiRain type={isMyTeamWinner ? 'winner' : 'loser'} />}
      <Page.Main blankBg>
        <View style={[Styles.header, { marginBottom: 16 }]}>
          {isFinalRound ? (
            <Fragment>
              <Text style={Theme.typography.h1}>
                {isTie ? 'Stalemate' : isMyTeamWinner ? 'Your team won!' : 'Your team lost!'}
              </Text>
              <Text style={Theme.typography.body}>
                {isTie ? "It's a tie" : isMyTeamWinner ? 'They new stood a change' : 'Yikes.'}
              </Text>
            </Fragment>
          ) : (
            <Fragment>
              <Text style={Theme.typography.h3}>
                {isTie
                  ? "It's a tie!"
                  : isMyTeamWinner
                  ? 'Your team won this round!'
                  : 'Your team lost this round...'}
              </Text>
            </Fragment>
          )}
        </View>

        <GameScore BOAT={isFinalRound} />
      </Page.Main>
      <Page.CTAs blankBg>
        {isFinalRound ? (
          <Button onPress={Papers.leaveGame}>Go to homepage</Button>
        ) : (
          <Button onPress={handleReadyClick}>
            {`I'm ready for round ${round.current + 1 + 1}!`}
          </Button>
        )}
      </Page.CTAs>
    </Fragment>
  )
}

export default RoundScore
