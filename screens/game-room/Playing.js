import React from 'react'
import { Text } from 'react-native'

import { useCountdown, usePrevious, getRandomInt } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'

import { MyTurnGetReady, MyTurnGo, OthersTurn, RoundScore } from './playing-views'

import Page from '@components/page'
import i18n from '@constants/i18n'

import * as Theme from '@theme'
// import Styles from './PlayingStyles.js'

const ANIM_PAPER_NEXT = 500

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc]

export default function Playing() {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const round = game.round
  // const hasStatusGetReady = round.status === 'getReady';
  const hasStatusFinished = round.status === 'finished'
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status)
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted)
  // const profileIsAdmin = game.creatorId === profile.id
  const initialTimer = 60000 // game.settings.time_ms;
  const timerReady = 3400
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }) // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000)
  const countdownSec = Math.round(countdown / 1000)
  const blurTime = 1500 // TODO - game individual setting
  // const prevCountdownSec = usePrevious(countdownSec);
  // const [timesUp, setTimesup] = React.useState(false);

  const roundIndex = round.current
  const { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd } = round?.turnWho || {}
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex]
  const isMyTurn = turnPlayerId === profile.id

  const [papersTurn, setPapersTurn] = React.useState(null)

  // const [isVisiblePassedPapers, togglePassedPapers] = React.useState(false);
  const [paperAnim, setPaperAnimation] = React.useState(null) // gotcha || nope
  const [isPaperBlur, setPaperBlur] = React.useState(false)
  const [isPaperChanging, setIsPaperChanging] = React.useState(false)
  const blurTimeout = React.useRef()
  const papersTurnCurrent = papersTurn?.current
  const isCount321go = countdownSec > initialTimerSec

  React.useEffect(() => {
    async function getTurnState() {
      // Turn this into a custom hook.
      const turnState = await Papers.getTurnLocalState()
      setPapersTurn(turnState)
    }
    getTurnState()
  }, [])

  React.useEffect(() => {
    if (!isCount321go) {
      console.log('useEffect:: 1º blur paper')
      setPaperBlur(false)
      clearTimeout(blurTimeout.current)
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime)
    }
  }, [isCount321go])

  React.useEffect(() => {
    if (papersTurnCurrent !== null && !isCount321go) {
      console.log('useEffect:: timeout blur paper')
      setPaperBlur(false)
      clearTimeout(blurTimeout.current)
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime)
    }
  }, [papersTurnCurrent, isCount321go])

  React.useEffect(() => {
    // use false to avoid undefined on first render
    if (prevHasCountdownStarted === false && hasCountdownStarted) {
      console.log('useEffect:: hasCountdownStarted')
      pickFirstPaper()
      startCountdown(round.status)
    }
  }, [startCountdown, round.status, prevHasCountdownStarted, hasCountdownStarted]) // eslint-disable-line

  function getPaperByKey(key) {
    const paper = game.words._all[key]
    if (!paper) {
      console.warn(`key "${key}" does not match a paper!`)
    }
    return paper
  }

  // TODO/NOTE: pickFirstPaper, pickNextPaper and togglePaper should be on PapersContext
  function pickFirstPaper() {
    setPapersTurn(() => {
      const state = {
        current: null,
        passed: [],
        guessed: [],
        wordsLeft: round.wordsLeft,
      }

      if (round.wordsLeft.length === 0) {
        // words ended
        Papers.setTurnLocalState(state)
        return state
      }

      const wordsToPick = [...state.wordsLeft]

      const wordIndex = getRandomInt(wordsToPick.length - 1)
      const nextPaper = wordsToPick[wordIndex]

      wordsToPick.splice(wordIndex, 1)

      state.current = nextPaper
      state.wordsLeft = wordsToPick

      Papers.setTurnLocalState(state)
      return state
    })
  }

  function pickNextPaper(hasGuessed = false) {
    // OPTIMIZE/NOTE : paper & word mean the same.
    const currentPaper = papersTurn.current
    let wordsToPick = []
    let pickingFrom = null // 'left' || 'passed'
    let wordsEnded = false

    if (papersTurn.wordsLeft.length > 0) {
      pickingFrom = 'left'
      wordsToPick = [...papersTurn.wordsLeft]
    } else if (papersTurn.passed.length > 0) {
      pickingFrom = 'passed'
      wordsToPick = [...papersTurn.passed]
    } else {
      wordsEnded = true
    }

    setPapersTurn(state => {
      const wordsModified = {}
      const wordIndex = !wordsEnded ? getRandomInt(wordsToPick.length - 1) : 0
      let nextPaper = wordsEnded ? null : wordsToPick[wordIndex]

      if (!wordsEnded && nextPaper === null) {
        console.error('Ups nextPaper!', wordIndex, wordsToPick)
      }

      if (!wordsEnded) {
        wordsToPick.splice(wordIndex, 1)
      }

      if (hasGuessed) {
        wordsModified.guessed = [...state.guessed, currentPaper]

        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick
        } else if (pickingFrom === 'passed') {
          wordsModified.passed = wordsToPick
        }
      } else {
        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick
          wordsModified.passed = [...state.passed, currentPaper]
        } else if (pickingFrom === 'passed') {
          if (wordsToPick.length > 0) {
            wordsModified.passed = [...wordsToPick, currentPaper]
          } else {
            // When it's the last word,
            // but no stress because "next paper" button is disable
            nextPaper = currentPaper // REVIEW: Why did I do this line?
            wordsModified.passed = []
          }
        }
      }

      const newState = {
        ...state,
        ...wordsModified,
        current: nextPaper,
      }

      Papers.setTurnLocalState(newState)
      return newState
    })
    setPaperBlur(false)
  }

  function togglePaper(paper, hasGuessed) {
    // TODO/BUG: When papers are all guessed and here I select one as not guessed.
    //  - The timer continues but the current word is empty.
    setPapersTurn(state => {
      const wordsModified = {}
      if (hasGuessed) {
        const wordsToPick = [...state.passed]
        const wordIndex = wordsToPick.indexOf(paper)
        wordsToPick.splice(wordIndex, 1)

        wordsModified.guessed = [...state.guessed, paper]
        wordsModified.passed = wordsToPick
      } else {
        const wordsToPick = [...state.guessed]
        console.log('wordsToPick:', wordsToPick)
        const wordIndex = wordsToPick.indexOf(paper)
        wordsToPick.splice(wordIndex, 1)

        // It means all papers were guessed before
        // and now there's a new paper to guess!
        if (countdown && !state.passed.length) {
          wordsModified.current = paper
        } else {
          wordsModified.passed = [...state.passed, paper]
        }
        wordsModified.guessed = wordsToPick
      }

      const newState = {
        ...state,
        ...wordsModified,
      }

      Papers.setTurnLocalState(newState)
      return newState
    })
  }

  function handlePaperClick(hasGuessed) {
    if (isPaperChanging) {
      return
    }

    setIsPaperChanging(true)
    setPaperAnimation(hasGuessed ? 'gotcha' : 'nope')
    setPaperBlur(false)
    clearTimeout(blurTimeout.current)

    setTimeout(() => {
      setPaperAnimation(null)
      setIsPaperChanging(false)
      pickNextPaper(hasGuessed)
    }, ANIM_PAPER_NEXT)
  }

  function handleStartClick() {
    Papers.startTurn()
  }

  function handleFinishTurnClick() {
    // TODO - add loading state.
    // setPapersTurn({}); should it be done here?
    Papers.finishTurn(papersTurn)
    // just to double check...
    setPaperBlur(false)
    setIsPaperChanging(false)
  }

  if (!papersTurn) {
    return (
      <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 200 }]}>
        Loading... hold on! ⏳
      </Text>
    )
  }

  // -------- other stuff

  const isAllWordsGuessed = game.papersGuessed === game.round.wordsLeft?.length

  // Some memo here would be nice.
  const turnStatus = (() => {
    const isTurnOn = !hasCountdownStarted || !!countdownSec // aka: it isn't times up
    // Ai jasus...
    const { 0: teamIx, 1: tPlayerIx, 2: tisOdd } = isTurnOn
      ? { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd }
      : Papers.getNextTurn()
    const tPlayerId = game.teams[teamIx].players[tisOdd ? 0 : tPlayerIx]

    return {
      title: isTurnOn ? 'Playing now' : 'Next up!',
      player: {
        name: tPlayerId === profile.id ? 'You!' : profiles[tPlayerId]?.name || `? ${tPlayerId} ?`,
        avatar: profiles[tPlayerId]?.avatar,
      },
      teamName: game.teams[teamIx].name,
    }
  })()

  return (
    <Page>
      <Page.Header></Page.Header>
      {hasStatusFinished ? (
        <RoundScore />
      ) : isMyTurn ? (
        !hasCountdownStarted ? (
          <MyTurnGetReady
            nr={roundIndex + 1}
            description={DESCRIPTIONS[roundIndex]}
            onStartClick={handleStartClick}
            isOdd={isOdd}
          />
        ) : (
          <MyTurnGo
            papersTurn={papersTurn}
            // --
            initialTimerSec={initialTimerSec}
            countdown={countdown}
            countdownSec={countdownSec}
            isCount321go={isCount321go}
            // --
            togglePaper={togglePaper}
            onFinish={handleFinishTurnClick}
            getPaperByKey={getPaperByKey}
            setPaperBlur={setPaperBlur}
            // --
            paperAnim={paperAnim}
            isPaperBlur={isPaperBlur}
            isPaperChanging={isPaperChanging}
            onPaperClick={handlePaperClick}
          />
        )
      ) : (
        <OthersTurn
          description={DESCRIPTIONS[roundIndex]}
          thisTurnPlayer={profiles[game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex]]}
          turnStatus={turnStatus}
          hasCountdownStarted={hasCountdownStarted}
          countdownSec={countdownSec}
          countdown={countdown}
          isAllWordsGuessed={isAllWordsGuessed}
          initialTimerSec={initialTimerSec}
          initialTimer={initialTimer}
          roundIndex={roundIndex}
          papersGuessed={game.papersGuessed}
        />
      )}
    </Page>
  )
}
