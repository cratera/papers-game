import React, { Fragment } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import { msToSecPretty } from '@constants/utils'

import PapersContext from '@store/PapersContext.js'

import Page from '@components/page'
import TurnStatus from './TurnStatus'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const OthersTurn = ({
  description,
  hasCountdownStarted,
  countdownSec,
  countdown,
  initialTimerSec,
  initialTimer,
  thisTurnPlayerName,
  amIWaiting,
}) => {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const papersGuessed = game.papersGuessed
  const isAllWordsGuessed = papersGuessed === game.round.wordsLeft?.length
  const round = game.round
  const turnWho = round?.turnWho || {}
  const roundNr = round.current + 1
  const isTurnOn = !hasCountdownStarted || !!countdownSec // aka: it isn't times up
  const turnStatus = React.useMemo(() => {
    if (isAllWordsGuessed) {
      // No need to calculate this because the component is not rendered.
      return {}
    }

    const turnState = isTurnOn && !amIWaiting ? turnWho : Papers.getNextTurn()
    const teamId = turnState.team
    const tPlayerIx = turnState[turnState.team]
    const tPlayerId = game.teams[teamId].players[tPlayerIx]

    return {
      title: isTurnOn && game.hasStarted && !amIWaiting ? 'Playing now' : 'Next up',
      player: {
        name: tPlayerId === profile.id ? 'You!' : profiles[tPlayerId]?.name || `? ${tPlayerId} ?`,
        avatar: profiles[tPlayerId]?.avatar,
      },
      teamName:
        !game.hasStarted || amIWaiting
          ? 'Waiting for everyone to say they are ready.'
          : tPlayerId === profile.id
          ? `Waiting for ${thisTurnPlayerName} to finish their turn.`
          : game.teams[teamId].name,
    }
  }, [isAllWordsGuessed, isTurnOn])

  return (
    <Fragment>
      <Page.Main>
        <View>
          <View style={[Styles.header, { marginTop: 24 }]}>
            <Text style={Theme.typography.h3}>Round {roundNr}</Text>
            <Text style={[Theme.typography.secondary, Theme.u.center]}>
              {'\n'} {description}
            </Text>
          </View>
          <View style={Styles.main}>
            {!hasCountdownStarted ? (
              <Text style={Theme.typography.small}>Not started yet</Text>
            ) : countdownSec && !isAllWordsGuessed ? null : (
              <Fragment>
                <Text style={[Theme.typography.small]}>
                  {isAllWordsGuessed ? 'All papers guessed!' : "Time's up!"}
                </Text>
                <Text style={[Theme.typography.h1, Theme.u.center]}>
                  {thisTurnPlayerName} got {papersGuessed} papers right!
                </Text>
              </Fragment>
            )}
            <Text
              style={[
                Theme.typography.h1,
                {
                  marginVertical: 8,
                  color: hasCountdownStarted
                    ? countdown <= 10500
                      ? Theme.colors.danger
                      : Theme.colors.primary
                    : Theme.colors.grayDark,
                },
              ]}
            >
              {
                hasCountdownStarted
                  ? countdownSec > initialTimerSec // isCount321go
                    ? countdownSec - initialTimerSec // 3, 2, 1...
                    : countdownSec && !isAllWordsGuessed
                    ? msToSecPretty(countdown) // 59, 58, counting...
                    : '' // timeout or all words guessed
                  : msToSecPretty(initialTimer) // waiting to start
              }
            </Text>
            <Text style={Theme.typography.small}>{papersGuessed} papers guessed</Text>
          </View>
          {/* TODO - view when all papers were guessed */}
        </View>
      </Page.Main>
      <Page.CTAs blankBg>
        {isAllWordsGuessed ? (
          <View>
            <Text style={Theme.typography.h3}>End of Round {roundNr}</Text>
            <Text style={[Theme.typography.body, { marginTop: 16 }]}>
              Waiting for {thisTurnPlayerName} to finish their turn.
            </Text>
          </View>
        ) : (
          <TurnStatus
            title={turnStatus.title}
            player={turnStatus.player}
            teamName={turnStatus.teamName}
          />
        )}
      </Page.CTAs>
    </Fragment>
  )
}

OthersTurn.propTypes = {
  description: PropTypes.string.isRequired,
  hasCountdownStarted: PropTypes.bool.isRequired,
  countdownSec: PropTypes.number.isRequired,
  countdown: PropTypes.number.isRequired,
  initialTimerSec: PropTypes.number.isRequired,
  initialTimer: PropTypes.number.isRequired,
  thisTurnPlayerName: PropTypes.string.isRequired,
  /** I am ready, waiting for the next round to start. */
  amIWaiting: PropTypes.bool,
}

export default OthersTurn
