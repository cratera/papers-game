import { useEffect } from 'react'

import RoundScore from '@src/components/game/RoundScore'
import Page from '@src/components/page'
import i18n from '@src/constants/i18n'
import { useCountdown, usePrevious } from '@src/hooks'
import headerTheme from '@src/navigation/headerTheme'
import { MyTurnGetReady, MyTurnGo, OthersTurn } from '@src/screens/game-room/playing'
import { usePapersContext } from '@src/store/PapersContext'
import { Round } from '@src/store/PapersContext.types'
import { Redirect, Stack } from 'expo-router'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc]

export default function Game() {
  const Papers = usePapersContext()
  const { profile, profiles, game } = Papers.state
  const round = game?.round
  const roundIndex = (round && round.current) || 0

  const isRoundFinished = round?.status === 'finished'
  const hasCountdownStarted =
    typeof round?.status === 'string' && !['getReady', 'finished'].includes(round.status)
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted)
  const initialTimer = (roundIndex && game?.settings.time_ms[roundIndex]) || 0
  const timerReady = 3400 // 400 - threshold for io connection.
  const { timeLeft, restartCountdown } = useCountdown(
    hasCountdownStarted && typeof round?.status === 'number' ? round?.status : 0,
    {
      timer: initialTimer + timerReady,
    }
  ) // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000)
  const countdownSec = Math.round(timeLeft / 1000)

  const profileId = profile?.id
  const turnWho: Round['turnWho'] = round?.turnWho || ({} as Round['turnWho'])
  const turnTeam = turnWho?.team
  const turnPlayerId = game?.teams && game.teams[turnTeam].players[turnWho[turnTeam]]
  const thisTurnPlayer = profiles && turnPlayerId && profiles[turnPlayerId]
  const turnTeamName = game?.teams && turnTeam && game?.teams[turnTeam].name

  const isMyTurn = turnPlayerId === profileId
  const isCount321go = countdownSec > initialTimerSec
  const startedCounting = prevHasCountdownStarted === false && hasCountdownStarted

  const amIReady = game?.players && profileId && game?.players[profileId].isReady

  useEffect(() => {
    // use false to avoid undefined on first render
    if (startedCounting && typeof round?.status === 'number') {
      restartCountdown(round.status)
    }
  }, [startedCounting, restartCountdown, round?.status])

  if (!game) {
    return <Redirect href="/room/gate" />
  }

  return (
    <>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Playing',
          headerRight:
            isMyTurn && hasCountdownStarted
              ? undefined
              : function HLB() {
                  return <Page.HeaderBtnSettings />
                },
        }}
      />

      {isRoundFinished && amIReady ? (
        () => {
          const nextTurnWho = Papers.getNextTurn()
          const nextRoundIx = round?.current + 1
          const turnTeam = nextTurnWho?.team
          const turnPlayerId =
            game?.teams && turnTeam && game.teams[turnTeam].players[nextTurnWho[turnTeam]]
          const turnPlayer = profiles && turnPlayerId && profiles[turnPlayerId]
          const isMeNextTurn = turnPlayerId === profile.id

          // REVIEW / OPTIMIZE later. I don't like this duplication.
          // TODO: - <Page> should be inside of each view component,
          // so that it can show errors if needed
          return isMeNextTurn ? (
            <MyTurnGetReady description={DESCRIPTIONS[nextRoundIx]} amIWaiting />
          ) : (
            <OthersTurn
              description={DESCRIPTIONS[nextRoundIx]}
              thisTurnTeamName={turnTeamName || ''}
              thisTurnPlayer={turnPlayer || { name: '', avatar: 'abraul' }}
              hasCountdownStarted={false}
              countdownSec={initialTimerSec}
              countdown={initialTimer}
              initialTimerSec={initialTimerSec}
              initialTimer={initialTimer}
              amIWaiting={true}
            />
          )
        }
      ) : // BUG - Android (or slow phones?) RoundScore is visible for a few ms
      // before showing OthersTurn
      isRoundFinished ? (
        <RoundScore />
      ) : isMyTurn ? (
        !hasCountdownStarted ? (
          <MyTurnGetReady description={DESCRIPTIONS[roundIndex]} />
        ) : (
          <MyTurnGo
            startedCounting={startedCounting}
            initialTimerSec={initialTimerSec}
            countdown={timeLeft}
            countdownSec={countdownSec}
            isCount321go={isCount321go}
          />
        )
      ) : (
        <OthersTurn
          description={DESCRIPTIONS[roundIndex]}
          thisTurnTeamName={turnTeamName || ''}
          thisTurnPlayer={thisTurnPlayer || { name: '', avatar: 'abraul' }}
          hasCountdownStarted={hasCountdownStarted}
          countdownSec={countdownSec}
          countdown={timeLeft}
          initialTimerSec={initialTimerSec}
          initialTimer={initialTimer}
        />
      )}
    </>
  )
}
