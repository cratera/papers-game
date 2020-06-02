import React from 'react'
// import { Text } from 'react-native'
import PropTypes from 'prop-types'

import { useCountdown, usePrevious } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'
import { headerTheme } from '@navigation/headerStuff.js'

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
  const initialTimer = game.settings.time_ms * 50
  const timerReady = 3400 // 400 - threshold for io connection.
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady,
  }) // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000)
  const countdownSec = Math.round(countdown / 1000)

  const roundIndex = round.current
  const turnWho = round?.turnWho || {}
  const turnTeam = turnWho.team
  const turnPlayerId = game.teams[turnTeam].players[turnWho[turnTeam]]
  const thisTurnPlayer = profiles[turnPlayerId]

  const isMyTurn = turnPlayerId === profile.id
  const isCount321go = countdownSec > initialTimerSec
  const startedCounting = prevHasCountdownStarted === false && hasCountdownStarted

  React.useEffect(() => {
    // use false to avoid undefined on first render
    if (startedCounting) {
      console.log('useEffect:: hasCountdownStarted')
      startCountdown(round.status)
    }
  }, [startedCounting, startCountdown, round.status])

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme({ hiddenBorder: isMyTurn }),
      headerTitle: 'Playing',
      headerTintColor: Theme.colors.bg,
      headerRight: function HLB() {
        return <Page.HeaderBtnSettings />
      },
    })
  }, [isMyTurn])

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
          thisTurnPlayerName={thisTurnPlayer?.name || `? ${turnPlayerId} ?`}
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
