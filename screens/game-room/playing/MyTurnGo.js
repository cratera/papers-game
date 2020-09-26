import React from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import PropTypes from 'prop-types'

import { usePrevious, msToSecPretty, getRandomInt } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'
import Sentry from '@constants/Sentry'

import { BubblingCorner } from '@components/bubbling'
import Button from '@components/button'
import { LoadingBadge } from '@components/loading'
import Page from '@components/page'
// import i18n from '@constants/i18n'
import TurnScore from './TurnScore'
import { IconEyeClosed, IconEyeOpen, IconCheck, IconTimes } from '@components/icons'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const ANIM_PAPER_NEXT = 800

const BUB_CONFIG_PROPS = {
  nope: {
    corner: 'bottom-left',
    bgStart: Theme.colors.bg,
    bgEnd: Theme.colors.grayLight,
  },
  gotcha: {
    corner: 'bottom-right',
    bgStart: Theme.colors.bg,
    bgEnd: Theme.colors.green,
  },
}

const MyTurnGo = ({ startedCounting, initialTimerSec, countdown, countdownSec, isCount321go }) => {
  const Papers = React.useContext(PapersContext)
  const [isDone, setIsDone] = React.useState(false) // All words are guessed or timesups
  const [papersTurn, setPapersTurn] = React.useState(null)
  const [isPaperChanging, setIsPaperChanging] = React.useState(false)
  const [isFinishingTurn, setIsFinishingTurn] = React.useState(false)
  const [isPaperBlur, setPaperBlur] = React.useState(false)
  const [paperAnim, setPaperAnimation] = React.useState(null) // gotcha || nope
  const blurTimeout = React.useRef()

  const { game } = Papers.state
  const round = game.round
  const blurTime = 1500 // TODO - game individual setting
  const papersTurnCurrent = papersTurn?.current
  const stillHasWords =
    !papersTurn ||
    papersTurnCurrent !== null ||
    papersTurn.passed.length > 0 ||
    papersTurn.wordsLeft.length > 0
  const doneMsg = !stillHasWords ? 'All papers guessed!' : "Time's up!"
  const prevCountdownSec = usePrevious(countdownSec)

  React.useEffect(() => {
    async function getTurnState() {
      const turnState = await Papers.getTurnLocalState()
      setPapersTurn(turnState)
    }
    getTurnState()
  }, [])

  React.useLayoutEffect(() => {
    // these two effects (before and this one) need some refactor.
    // Read more below at pickFirstPaper
    if (startedCounting) {
      pickFirstPaper()
    }
  }, [startedCounting])

  React.useEffect(() => {
    if (!isCount321go) {
      setPaperBlur(false)
      clearTimeout(blurTimeout.current)
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime)
    }
  }, [isCount321go])

  React.useEffect(() => {
    if (!isCount321go && papersTurnCurrent !== null) {
      setPaperBlur(false)
      clearTimeout(blurTimeout.current)
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime)
    }
  }, [papersTurnCurrent, isCount321go])

  React.useLayoutEffect(() => {
    // Use prevCountdownSec to avoid a false positive
    // when the component mounts (3, 2, 1...)
    // BUG: When papers are finished + timesup, and the user removes
    // one paper and mark it as done again, this is executed.
    // showing the screen "All papers guessed!" again without need.
    // I didn't find a quick way to solve it :/
    if (!!prevCountdownSec && countdownSec === 0) {
      Papers.soundPlay('timesup')

      setIsDone(true)
      setTimeout(resetIsDone, 1500)
    }
  }, [countdownSec, prevCountdownSec])

  React.useLayoutEffect(() => {
    // REVIEW - Is this safe? In very slow phones may not work. (eg. 5 -> 3 )
    if (prevCountdownSec === 5 && countdownSec === 4 && stillHasWords) {
      Papers.soundPlay('bomb')
    }
  }, [countdownSec, prevCountdownSec, stillHasWords])

  React.useLayoutEffect(() => {
    if (!stillHasWords) {
      setIsDone(true)
      setTimeout(resetIsDone, 1500)
    }
  }, [stillHasWords])

  function resetIsDone() {
    setIsDone(false)
  }

  function getPaperByKey(key) {
    const paper = game.words._all[key]
    if (!paper) {
      if (__DEV__) console.warn(`key "${key}" does not match a paper!`)
      Sentry.withScope(scope => {
        scope.setExtra('response', JSON.stringify(game))
        Sentry.captureException(Error(`PapersByKey ${key} failed.`))
      })
    }
    return paper
  }

  // TODO/NOTE: pickFirstPaper, pickNextPaper and togglePaper should be on PapersContext
  function pickFirstPaper() {
    setPapersTurn(realState => {
      // console.log('PICK_FIRST', realState) // realState is null cause LS wasn't ready yet
      // TODO/?BUG - This state may colide with papersTurn from getTurnLocalState()...
      const state = realState || {
        current: null,
        passed: [],
        guessed: [],
        sorted: [],
        wordsLeft: round.wordsLeft,
        toggled_to_yes: 0,
        toggled_to_no: 0,
        revealed: 0,
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

      // ... but it does not, after some logs (locally) it does not colide. But still
      // It's a dangerous and probably buggy in slow phones. This needs a refactor for TOMORROW!

      Papers.setTurnLocalState(state) // REVIEW - this is async and a side effect. is it the right place?
      return state
    })
  }

  function pickNextPaper(hasGuessed) {
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

      if (nextPaper === undefined) {
        Sentry.withScope(scope => {
          scope.setExtra('response', JSON.stringify(papersTurn))
          Sentry.captureException(Error('setPapersTurn() - nextPapers undefined'))
        })
      }

      if (!wordsEnded && nextPaper === null) {
        Sentry.withScope(scope => {
          scope.setExtra('response', JSON.stringify(papersTurn))
          Sentry.captureException(Error('setPapersTurn() - Ups nextPaper'))
        })
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
        sorted: [...state.sorted, currentPaper],
        current: nextPaper,
      }

      // Hum... side effect inside a setState. ai ai ai...
      Papers.setTurnLocalState(newState)

      return newState
    })
    setPaperBlur(false)
  }

  function handlePaperClick(hasGuessed) {
    if (isPaperChanging) {
      return
    }

    Papers.soundPlay(hasGuessed ? 'right' : 'wrong')

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

  function togglePaper(paper, hasGuessed) {
    setPapersTurn(state => {
      const wordsModified = {}
      if (hasGuessed) {
        const wordsToPick = [...state.passed]
        const wordIndex = wordsToPick.indexOf(paper)
        wordsToPick.splice(wordIndex, 1)

        wordsModified.guessed = [...state.guessed, paper]
        wordsModified.passed = wordsToPick
        wordsModified.toggled_to_yes = state.toggled_to_yes + 1
      } else {
        const wordsToPick = [...state.guessed]
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
        wordsModified.toggled_to_no = state.toggled_to_no + 1
      }

      const newState = {
        ...state,
        ...wordsModified,
      }
      Papers.soundPlay(hasGuessed ? 'right' : 'wrong')
      Papers.setTurnLocalState(newState)
      return newState
    })
  }

  function handleFinishTurnClick() {
    if (isFinishingTurn) return false
    setIsFinishingTurn(true)

    // just to double check...
    setPaperBlur(false)
    setIsPaperChanging(false)

    try {
      // Cleanup local papers turn to avoid memory leaks.
      // Ex: Start a new game, the LS may still contain data from prev game
      // Q: Maybe do this when game starts. Dunno what's the best place to do it.
      // A: Keep this. If the user closes/minimize the app (eg. to go to twitter)
      //    and comes back when its their turn again, we guarantee the local state is cleaned.
      Papers.setTurnLocalState(null)
      Papers.finishTurn(papersTurn)
    } catch (e) {
      // TODO later errorMsg
      setIsFinishingTurn(false)
    }
  }

  if (!papersTurn) {
    return (
      <Page>
        <Page.Main>
          <LoadingBadge>Loading...</LoadingBadge>
        </Page.Main>
      </Page>
    )
  }

  if (isDone) {
    return (
      <Page>
        <Page.Main>
          <Text style={[Theme.typography.body, Styles.go_count321, { color: Theme.colors.danger }]}>
            {msToSecPretty(countdown)}
          </Text>
          <Text style={[Theme.typography.h1, Styles.go_done_msg]}>{doneMsg}</Text>
        </Page.Main>
      </Page>
    )
  }

  if (isCount321go) {
    return (
      <Page>
        <Page.Main style={[Styles.go_countMain, { marginTop: 40 }]}>
          <Text style={[Theme.typography.body, Styles.go_count321]}>
            {countdownSec - initialTimerSec}
          </Text>
        </Page.Main>
      </Page>
    )
  }

  // BUG - This view shows for 5ms before the isCount321go.
  if (!stillHasWords || countdownSec === 0) {
    return (
      <TurnScore
        papersTurn={papersTurn}
        onTogglePaper={togglePaper}
        type={!stillHasWords ? 'nowords' : 'timesup'}
        onFinish={handleFinishTurnClick}
        getPaperByKey={getPaperByKey}
        isSubmitting={isFinishingTurn}
      />
    )
  }

  return (
    <Page>
      {paperAnim && <BubblingCorner duration={ANIM_PAPER_NEXT} {...BUB_CONFIG_PROPS[paperAnim]} />}
      <Page.Main>
        <Text
          style={[
            Theme.typography.body,
            Styles.go_count321,
            // countdown <= 4500 && { color: Theme.colors.danger },
          ]}
        >
          {msToSecPretty(countdown)}
        </Text>
        <View style={Styles.go_zone}>
          <TouchableHighlight
            underlayColor={Theme.colors.bg}
            onPressIn={() => {
              setPapersTurn(state => ({
                ...state,
                revealed: state.revealed + 1,
              }))
              setPaperBlur(false)
            }}
            onPressOut={() => setPaperBlur(true)}
          >
            <View
              style={[
                Styles.go_paper,
                // Styles[`go_paper_${paperAnim}`]
              ]}
            >
              <View style={Styles.go_paper_sentence}>
                {(getPaperByKey(papersTurnCurrent) || `😱 BUG 😱 ${papersTurnCurrent} (Click pass)`)
                  .split(' ')
                  .map((word, i) => (
                    <Text
                      key={`${word}_${i}`}
                      style={[
                        Theme.typography.h2,
                        Styles.go_paper_word,
                        isPaperBlur && Styles.go_paper_blur,
                        Styles[`go_paper_word_${paperAnim}`],
                      ]}
                    >
                      {word}
                    </Text>
                  ))}
              </View>
              <Text style={Styles.go_paper_key}>{String(papersTurnCurrent)}</Text>
              <View style={Styles.go_paper_icon} accessible={false}>
                {isPaperBlur && !isPaperChanging ? (
                  <IconEyeClosed style={Styles.go_paper_iconSvg} color={Theme.colors.grayDark} />
                ) : (
                  <IconEyeOpen style={Styles.go_paper_iconSvg} color={Theme.colors.grayDark} />
                )}
              </View>
            </View>
          </TouchableHighlight>
        </View>

        {/* {true && (
          <View style={{ display: 'block' }}>
            <Text style={{ fontSize: 10, lineHeight: 10 }}>
              {'\n'} - passed: {papersTurn.passed.join(', ')} {'\n'} - guessed:{' '}
              {papersTurn.guessed.join(', ')} {'\n'} - wordsLeft: {papersTurn.wordsLeft.join(', ')}{' '}
            </Text>
          </View>
        )} */}
      </Page.Main>

      <Page.CTAs style={Styles.go_ctas}>
        {papersTurn.current !== null &&
        !papersTurn.wordsLeft.length &&
        !papersTurn.passed.length ? (
          <Text numberOfLines={1} style={[Theme.typography.secondary, Theme.u.center]}>
            Last paper!
          </Text>
        ) : (
          <>
            <Button
              variant="icon"
              size="lg"
              loadingColor={Theme.colors.bg}
              style={Styles.go_ctas_no}
              accessibilityLabel="Pass"
              isLoading={isPaperChanging && paperAnim === 'nope'}
              onPress={() => !isPaperChanging && handlePaperClick(false)}
            >
              <IconTimes size={24} color={Theme.colors.bg} />
            </Button>
          </>
        )}

        {isPaperChanging && paperAnim && (
          <Text style={[Theme.typography.body, Theme.u.center, { flexGrow: 1 }]}>
            {paperAnim === 'gotcha' ? 'Good job!' : 'Damn it...'}
          </Text>
        )}
        <Button
          variant="icon"
          size="lg"
          loadingColor={Theme.colors.bg}
          style={Styles.go_ctas_yes}
          accessibilityLabel="Got it"
          isLoading={isPaperChanging && paperAnim === 'gotcha'}
          onPress={() => !isPaperChanging && handlePaperClick(true)}
        >
          <IconCheck size={24} color={Theme.colors.bg} />
        </Button>
      </Page.CTAs>
    </Page>
  )
}

MyTurnGo.propTypes = {
  startedCounting: PropTypes.bool,
  initialTimerSec: PropTypes.number,
  countdown: PropTypes.number,
  countdownSec: PropTypes.number,
  isCount321go: PropTypes.bool,
}

export default MyTurnGo
