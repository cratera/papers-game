import React from 'react'
// import { Text } from 'react-native'
import PropTypes from 'prop-types'

import { useCountdown, usePrevious } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'
import { headerTheme } from '@navigation/headerStuff.js'

import { MyTurnGetReady, MyTurnGo, OthersTurn, RoundScore } from './index'

import Page from '@components/page'
import i18n from '@constants/i18n'

// import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc]

export default function PlayingEntry({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const round = game.round

  const isRoundFinished = round.status === 'finished'
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status)
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted)
  const initialTimer = game.settings.time_ms
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
  const turnTeamName = game.teams[turnTeam].name

  const isMyTurn = turnPlayerId === profile.id
  const isCount321go = countdownSec > initialTimerSec
  const startedCounting = prevHasCountdownStarted === false && hasCountdownStarted

  const amIReady = game.players[profile.id].isReady

  React.useEffect(() => {
    // use false to avoid undefined on first render
    if (startedCounting) {
      console.log('useEffect:: hasCountdownStarted')
      startCountdown(round.status)
    }
  }, [startedCounting, startCountdown, round.status])

  React.useEffect(() => {
    setNavigation()
  }, [isMyTurn, amIReady, isRoundFinished])

  function setNavigation() {
    // OPTIMIZE - Handle nav options across diff screens in a smarter way.
    navigation.setOptions({
      ...headerTheme({
        hiddenBorder: isMyTurn || (isRoundFinished && amIReady), // bug: should be true if !isMeNextTurn
        hiddenTitle: true,
      }),
      headerTitle: 'Playing',
      headerRight: function HLB() {
        return <Page.HeaderBtnSettings />
      },
    })
  }

  if (isRoundFinished && amIReady) {
    const nextTurnWho = Papers.getNextTurn()
    const nextRoundIx = round.current + 1
    const turnTeam = nextTurnWho.team
    const turnPlayerId = game.teams[turnTeam].players[nextTurnWho[turnTeam]]
    const turnPlayer = profiles[turnPlayerId]
    const isMeNextTurn = turnPlayerId === profile.id

    // REVIEW / OPTIMIZE later. I don't like this duplication.
    // TODO - <Page> should be inside of each view component,
    // so that it can show errors if needed
    return isMeNextTurn ? (
      <MyTurnGetReady description={DESCRIPTIONS[nextRoundIx]} amIWaiting={true} />
    ) : (
      <OthersTurn
        roundIx={nextRoundIx}
        description={DESCRIPTIONS[nextRoundIx]}
        thisTurnTeamName={turnTeamName}
        thisTurnPlayerName={turnPlayer?.name || `? ${turnPlayer} ?`}
        hasCountdownStarted={false}
        countdownSec={initialTimerSec}
        countdown={initialTimer}
        initialTimerSec={initialTimerSec}
        initialTimer={initialTimer}
        amIWaiting={true}
      />
    )
  }

  // BUG - Android (or slow phones?) RoundScore is visible for a few ms
  // before showing OthersTurn
  return isRoundFinished ? (
    <RoundScore navigation={navigation} onUnmount={setNavigation} />
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
      thisTurnTeamName={turnTeamName}
      thisTurnPlayerName={thisTurnPlayer?.name || `? ${turnPlayerId} ?`}
      hasCountdownStarted={hasCountdownStarted}
      countdownSec={countdownSec}
      countdown={countdown}
      initialTimerSec={initialTimerSec}
      initialTimer={initialTimer}
    />
  )
}

PlayingEntry.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
