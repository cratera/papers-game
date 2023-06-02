import PropTypes from 'prop-types'
import React from 'react'
import { Text, View } from 'react-native'

import { convertMsToSec } from '@src/utils/formatting'

import PapersContext from '@src/store/PapersContext.js'

import Avatar from '@src/components/avatar'
import Button from '@src/components/button'
import Page from '@src/components/page'

import * as Theme from '@src/theme'
import Styles from './PlayingStyles.js'

// TODO: REFACTOR later. This really needs some refactor.
const OthersTurn = ({
  description,
  hasCountdownStarted,
  countdownSec,
  countdown,
  initialTimerSec,
  initialTimer,
  thisTurnTeamName,
  thisTurnPlayer,
  amIWaiting,
}) => {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const papersGuessed = game.papersGuessed
  const isAllWordsGuessed = papersGuessed === game.round.wordsLeft?.length
  const round = game.round
  const turnWho = round?.turnWho || {}
  const roundNr = round.current + (amIWaiting ? 2 : 1)
  const isTurnOn = !hasCountdownStarted || !!countdownSec // aka: it isn't times up

  const playersOffline = Object.keys(game.players).filter((pId) => game.players[pId].isAfk).length
  const turnWhoStringified = JSON.stringify(turnWho) // This changing, means a turn was skipped.

  const turnStatus = React.useMemo(() => {
    const turnState = isTurnOn && !amIWaiting ? turnWho : Papers.getNextTurn()
    const teamId = turnState.team
    const tPlayerIx = turnState[turnState.team]
    const tPlayerId = game.teams[teamId].players[tPlayerIx]
    const tPlayer = game.players[tPlayerId] || {}

    return {
      title: isTurnOn && game.hasStarted && !amIWaiting ? 'Playing now:' : 'Next up:',
      player: {
        id: tPlayerId,
        isAfk: tPlayer.isAfk,
        name: tPlayerId === profile.id ? 'You!' : profiles[tPlayerId]?.name || `? ${tPlayerId} ?`,
        avatar: profiles[tPlayerId]?.avatar,
      },
      teamName:
        !game.hasStarted || amIWaiting
          ? 'Waiting for everyone to be ready.'
          : tPlayerId === profile.id // if we are the next one
          ? `Waiting for ${thisTurnPlayer.name || '???'} to finish their turn.`
          : game.teams[teamId].name,
    }
  }, [amIWaiting, isTurnOn, game.hasStarted, playersOffline, turnWhoStringified])

  console.log('...', game.players, playersOffline)

  return (
    <Page>
      <Page.Main>
        <View style={Styles.main}>
          <Text
            style={[
              Theme.typography.body,
              Styles.go_count321,
              {
                marginVertical: 8,
                color: hasCountdownStarted
                  ? countdown <= 10500
                    ? Theme.colors.danger
                    : Theme.colors.grayDark
                  : Theme.colors.grayMedium,
              },
            ]}
          >
            {
              hasCountdownStarted
                ? countdownSec > initialTimerSec // isCount321go
                  ? countdownSec - initialTimerSec // 3, 2, 1...
                  : countdownSec && !isAllWordsGuessed
                  ? convertMsToSec(countdown) // 59, 58, counting...
                  : '' // timeout or all words guessed
                : convertMsToSec(initialTimer) // waiting to start
            }
          </Text>

          {/* 
            TODO: HOLY MOTHER - OPTIMIZE!!!! This file is officially
            the most 🍝 code ever. Result of a lot of UI iterations
            and experimenting and lack of concentration.
            Just make it work, pure caos evil.
          */}
          <View style={[Styles.tst_flex]}>
            <Text style={[Theme.typography.secondary, Styles.tst_flex_title]}>
              {hasCountdownStarted && countdownSec && !isAllWordsGuessed
                ? `${papersGuessed} papers guessed`
                : !hasCountdownStarted
                ? turnStatus.title
                : countdownSec && !isAllWordsGuessed
                ? turnStatus.title
                : isAllWordsGuessed
                ? 'All papers guessed!'
                : "Time's up!"}
            </Text>
            <Avatar size="xl" src={thisTurnPlayer.avatar} alt="" />

            {!hasCountdownStarted || (countdownSec && !isAllWordsGuessed) ? (
              <>
                <Text
                  style={[
                    Theme.typography.h3,
                    Theme.utils.center,
                    { marginTop: 24, marginBottom: 8 },
                  ]}
                >
                  {!hasCountdownStarted ? thisTurnPlayer.name : turnStatus.player.name}
                </Text>
                <Text style={[Theme.typography.secondary, Theme.utils.center]}>
                  {!hasCountdownStarted ? thisTurnTeamName : turnStatus.teamName}
                </Text>
                {turnStatus.player.isAfk && (
                  // REVIEW @mmbotelho
                  <>
                    <Text
                      style={[
                        Theme.typography.error,
                        Theme.utils.center,
                        { marginTop: 12, marginBottom: 4 },
                      ]}
                    >
                      They seem offline.
                    </Text>
                    <Button size="sm" onPress={() => Papers.skipTurn(turnStatus.player.id)}>
                      Skip to another team member
                    </Button>
                  </>
                )}
              </>
            ) : countdownSec && !isAllWordsGuessed ? (
              <>
                <Text
                  style={[
                    Theme.typography.h3,
                    Theme.utils.center,
                    { marginTop: 24, marginBottom: 8 },
                  ]}
                >
                  {turnStatus.player.name}
                </Text>
                <Text style={[Theme.typography.secondary, Theme.utils.center]}>
                  {turnStatus.teamName}
                </Text>
              </>
            ) : (
              <Text
                style={[Theme.typography.h3, Theme.utils.center, { marginTop: 32, maxWidth: 320 }]}
              >
                {thisTurnTeamName} got {papersGuessed} papers right!
              </Text>
            )}
          </View>
        </View>
      </Page.Main>

      <Page.CTAs>
        <View style={[Styles.header]}>
          <Text style={Theme.typography.secondary}>
            {isAllWordsGuessed ? `End of round ${roundNr}` : `Round ${roundNr}`}
          </Text>
          <Text
            style={[Theme.typography.body, Theme.utils.center, { marginTop: 8, maxWidth: 300 }]}
          >
            {isTurnOn ? description : `Waiting for ${thisTurnPlayer.name}`}
          </Text>
          <Text
            style={[Theme.typography.small, Theme.utils.center, { marginTop: 8, maxWidth: 300 }]}
          >
            {isTurnOn ? '' : `Next up: ${turnStatus.player.name}`}
          </Text>
        </View>
      </Page.CTAs>
    </Page>
  )
}

OthersTurn.propTypes = {
  description: PropTypes.string.isRequired,
  hasCountdownStarted: PropTypes.bool.isRequired,
  countdownSec: PropTypes.number.isRequired,
  countdown: PropTypes.number.isRequired,
  initialTimerSec: PropTypes.number.isRequired,
  initialTimer: PropTypes.number.isRequired,
  thisTurnTeamName: PropTypes.string,
  thisTurnPlayer: PropTypes.object.isRequired,
  amIWaiting: PropTypes.bool,
}

export default OthersTurn
