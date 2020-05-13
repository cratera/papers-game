import React from 'react'
// import { Text } from 'react-native'
import PropTypes from 'prop-types'

import { useCountdown, usePrevious } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'

import { MyTurnGetReady, MyTurnGo, OthersTurn, RoundScore } from './index'

import Page from '@components/page'
import i18n from '@constants/i18n'

import * as Theme from '@theme'
// import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc]

export default function PlayingEntry({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const round = game.round
  const hasStatusFinished = round.status === 'finished'
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status)
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted)
  const initialTimer = 30000 // game.settings.time_ms;
  const timerReady = 3400
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }) // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000)
  const countdownSec = Math.round(countdown / 1000)

  const roundIndex = round.current
  const { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd } = round?.turnWho || {}
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex]
  const isMyTurn = turnPlayerId === profile.id

  const isCount321go = countdownSec > initialTimerSec
  const startedCounting = prevHasCountdownStarted === false && hasCountdownStarted
  const thisTurnPlayer = profiles[game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex]]

  React.useEffect(() => {
    // use false to avoid undefined on first render
    if (startedCounting) {
      console.log('useEffect:: hasCountdownStarted')
      startCountdown(round.status)
    }
  }, [startedCounting, startCountdown, round.status])

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Playing',
      headerRight: function HLB() {
        return <Page.HeaderBtnSettings />
      },
      headerTintColor: Theme.colors.bg,
      headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
      },
    })
  }, [])

  // Some memo here would be nice.
  const turnStatus = (() => {
    const isTurnOn = !hasCountdownStarted || !!countdownSec // aka: it isn't times up
    // Ai jasus... 🙈
    const { 0: teamIx, 1: tPlayerIx, 2: tisOdd } = isTurnOn
      ? { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd }
      : Papers.getNextTurn()
    const tPlayerId = game.teams[teamIx].players[tisOdd ? 0 : tPlayerIx]

    return {
      title: isTurnOn && game.hasStarted ? 'Playing now' : 'Next up!',
      player: {
        name: tPlayerId === profile.id ? 'You!' : profiles[tPlayerId]?.name || `? ${tPlayerId} ?`,
        avatar: profiles[tPlayerId]?.avatar,
      },
      teamName: !game.hasStarted
        ? 'Waiting for everyone to say they are ready.'
        : tPlayerId === profile.id
        ? `Waiting for ${thisTurnPlayer?.name} to finish their turn.` // REVIEW
        : game.teams[teamIx].name,
    }
  })()

  return (
    <Page>
      {hasStatusFinished ? (
        <RoundScore />
      ) : isMyTurn ? (
        !hasCountdownStarted ? (
          <MyTurnGetReady description={DESCRIPTIONS[roundIndex]} />
        ) : (
          <MyTurnGo
            startedCounting={startedCounting}
            initialTimerSec={initialTimerSec}
            countdown={countdown}
            countdownSec={countdownSec}
            isCount321go={isCount321go}
          />
        )
      ) : (
        <OthersTurn
          description={DESCRIPTIONS[roundIndex]}
          thisTurnPlayerName={thisTurnPlayer?.name}
          turnStatus={turnStatus}
          hasCountdownStarted={hasCountdownStarted}
          countdownSec={countdownSec}
          countdown={countdown}
          initialTimerSec={initialTimerSec}
          initialTimer={initialTimer}
        />
      )}
    </Page>
  )
}

PlayingEntry.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
