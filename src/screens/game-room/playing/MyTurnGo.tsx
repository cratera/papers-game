import React, { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

import { usePrevious } from '@src/hooks'
import * as Sentry from '@src/services/sentry'
import PapersContext from '@src/store/PapersContext'
import { convertMsToSec } from '@src/utils/formatting'
import { getRandomInt } from '@src/utils/misc'

import { BubblingCorner } from '@src/components/bubbling'
import Button from '@src/components/button'
import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
// import i18n from '@src/constants/i18n'
import { IconCheck, IconEyeClosed, IconEyeOpen, IconTimes } from '@src/components/icons'
import TurnScore from './TurnScore'

import { BubblingCornerProps } from '@src/components/bubbling/Bubbling.types'
import { Turn } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import Styles from './Playing.styles.js'
import { MyTurnGoProps } from './Playing.types'

const ANIM_PAPER_NEXT = 800

const BUB_CONFIG_PROPS = {
  nope: {
    corner: 'bottom-left',
    bgStart: 'bg',
    bgEnd: 'grayLight',
    duration: ANIM_PAPER_NEXT,
  },
  gotcha: {
    corner: 'bottom-right',
    bgStart: 'bg',
    bgEnd: 'green',
    duration: ANIM_PAPER_NEXT,
  },
} satisfies Record<string, BubblingCornerProps>

const MyTurnGo = ({
  startedCounting,
  initialTimerSec,
  countdown,
  countdownSec,
  isCount321go,
}: MyTurnGoProps) => {
  const Papers = React.useContext(PapersContext)
  const [isDone, setIsDone] = React.useState(false) // All words are guessed or timesups
  const [papersTurn, setPapersTurn] = React.useState<Turn>()
  const [isPaperChanging, setIsPaperChanging] = React.useState(false)
  const [isFinishingTurn, setIsFinishingTurn] = React.useState(false)
  const [isPaperBlur, setPaperBlur] = React.useState(false)
  const [paperAnim, setPaperAnimation] = React.useState<'gotcha' | 'nope' | null>(null)
  const blurTimeout = React.useRef<NodeJS.Timeout>()

  const { game } = Papers.state
  const round = game?.round
  const blurTime = 1500 // TODO: game individual setting
  const papersTurnCurrent = papersTurn?.current
  const stillHasWords =
    !papersTurn ||
    papersTurnCurrent !== null ||
    // papersTurn.passed.length > 0 ||
    papersTurn.wordsLeft.length > 0
  const doneMsg = !stillHasWords ? 'All papers guessed!' : "Time's up!"
  const prevCountdownSec = usePrevious(countdownSec)

  useEffectOnce(() => {
    async function getTurnState() {
      const turnState = await Papers.getTurnLocalState()
      setPapersTurn(turnState)
    }
    getTurnState()
  })

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
  }, [Papers, countdownSec, prevCountdownSec])

  React.useLayoutEffect(() => {
    // REVIEW - Is this safe? In very slow phones may not work. (eg. 5 -> 3 )
    if (prevCountdownSec === 5 && countdownSec === 4 && stillHasWords) {
      Papers.soundPlay('bomb')
    }
  }, [Papers, countdownSec, prevCountdownSec, stillHasWords])

  React.useLayoutEffect(() => {
    if (!stillHasWords) {
      setIsDone(true)
      setTimeout(resetIsDone, 1500)
    }
  }, [stillHasWords])

  function resetIsDone() {
    setIsDone(false)
  }

  function getPaperByKey(key: number) {
    const paper = game?.words?._all[key]
    if (!paper) {
      if (__DEV__) console.warn(`key "${key}" does not match a paper!`)
      Sentry.withScope((scope) => {
        scope.setExtra('response', JSON.stringify(game))
        Sentry.captureException(Error(`PapersByKey ${key} failed.`))
      })
    }
    return paper || ''
  }

  // TODO:(NOTE): pickFirstPaper, pickNextPaper and togglePaper should be on PapersContext
  const pickFirstPaper = useCallback(() => {
    setPapersTurn((realState) => {
      // console.log('PICK_FIRST', realState) // realState is null cause LS wasn't ready yet
      // TODO:(BUG) - This state may colide with papersTurn from getTurnLocalState()...
      const state: Turn = realState || {
        current: 0,
        passed: [],
        guessed: [],
        sorted: [],
        wordsLeft: round?.wordsLeft || [],
        toggled_to_yes: 0,
        toggled_to_no: 0,
        revealed: 0,
      }

      if (round?.wordsLeft.length === 0) {
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
  }, [Papers, round?.wordsLeft])

  React.useLayoutEffect(() => {
    // these two effects (before and this one) need some refactor.
    // Read more below at pickFirstPaper
    if (startedCounting) {
      pickFirstPaper()
    }
  }, [pickFirstPaper, startedCounting])

  function pickNextPaper(hasGuessed: boolean) {
    // OPTIMIZE/NOTE : paper & word mean the same.
    let currentPaper: number

    if (papersTurn?.current) {
      currentPaper = papersTurn?.current
    }

    let wordsToPick: Turn['wordsLeft']
    let pickingFrom: 'left' | 'passed'
    let wordsEnded = false

    if (papersTurn?.wordsLeft && papersTurn.wordsLeft.length > 0) {
      pickingFrom = 'left'
      wordsToPick = [...papersTurn.wordsLeft]
    } else if (papersTurn?.passed && papersTurn.passed.length > 0) {
      pickingFrom = 'passed'
      wordsToPick = [...papersTurn.passed]
    } else {
      wordsEnded = true
    }

    setPapersTurn((state) => {
      const wordsModified = {} as Turn
      const wordIndex = !wordsEnded ? getRandomInt(wordsToPick.length - 1) : 0
      let nextPaper = wordsEnded ? null : wordsToPick[wordIndex]

      if (nextPaper === undefined) {
        Sentry.withScope((scope) => {
          scope.setExtra('response', JSON.stringify(papersTurn))
          Sentry.captureException(Error('setPapersTurn() - nextPapers undefined'))
        })
      }

      if (!wordsEnded && nextPaper === null) {
        Sentry.withScope((scope) => {
          scope.setExtra('response', JSON.stringify(papersTurn))
          Sentry.captureException(Error('setPapersTurn() - Ups nextPaper'))
        })
      }

      if (!wordsEnded) {
        wordsToPick.splice(wordIndex, 1)
      }

      if (hasGuessed) {
        wordsModified.guessed = [...(state?.guessed || []), currentPaper]

        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick
        } else if (pickingFrom === 'passed') {
          wordsModified.passed = wordsToPick
        }
      } else {
        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick
          wordsModified.passed = [...(state?.passed || []), currentPaper]
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

      const newState: Turn = {
        ...state,
        ...wordsModified,
        sorted: [...(state?.sorted || []), currentPaper],
        current: nextPaper,
      }

      // Hum... side effect inside a setState. ai ai ai...
      Papers.setTurnLocalState(newState)

      return newState
    })
    setPaperBlur(false)
  }

  function handlePaperClick(hasGuessed: boolean) {
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

  function togglePaper(paper: number, hasGuessed: boolean) {
    setPapersTurn((state) => {
      const wordsModified = {} as Turn
      if (hasGuessed) {
        const wordsToPick = [...(state?.passed || [])]
        const wordIndex = wordsToPick.indexOf(paper)
        wordsToPick.splice(wordIndex, 1)

        wordsModified.guessed = [...(state?.guessed || []), paper]
        wordsModified.passed = wordsToPick
        wordsModified.toggled_to_yes = (state?.toggled_to_yes || 0) + 1
      } else {
        const wordsToPick = [...(state?.guessed || [])]
        const wordIndex = wordsToPick.indexOf(paper)
        wordsToPick.splice(wordIndex, 1)

        // It means all papers were guessed before
        // and now there's a new paper to guess!
        if (countdown && !state?.passed.length) {
          wordsModified.current = paper
        } else {
          wordsModified.passed = [...(state?.passed || []), paper]
        }
        wordsModified.guessed = wordsToPick
        wordsModified.toggled_to_no = (state?.toggled_to_no || 0) + 1
      }

      const newState: Turn = {
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
      if (papersTurn) {
        Papers.finishTurn(papersTurn)
      }
    } catch (e) {
      // TODO: later errorMsg
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
            {convertMsToSec(countdown)}
          </Text>
          <Text style={[Theme.typography.h1, Styles.go_done_msg]}>{doneMsg}</Text>
        </Page.Main>
      </Page>
    )
  }

  if (isCount321go) {
    return (
      <Page>
        <Page.Main>
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
      {paperAnim && <BubblingCorner {...BUB_CONFIG_PROPS[paperAnim]} />}
      <Page.Main>
        <Text
          style={[
            Theme.typography.body,
            Styles.go_count321,
            // countdown <= 4500 && { color: Theme.colors.danger },
          ]}
        >
          {convertMsToSec(countdown)}
        </Text>
        <View style={Styles.go_zone}>
          <Pressable
            onPressIn={() => {
              setPapersTurn((state) => {
                const newState: Turn = {
                  ...(state || ({} as Turn)),
                  revealed: (state?.revealed || 0) + 1,
                }

                return newState
              })
              setPaperBlur(false)
            }}
            onPressOut={() => setPaperBlur(true)}
          >
            <View style={Styles.go_paper}>
              <View style={Styles.go_paper_sentence}>
                {papersTurnCurrent &&
                  (
                    getPaperByKey(papersTurnCurrent) ||
                    `😱 BUG 😱 ${papersTurnCurrent} (Click pass)`
                  )
                    .split(' ')
                    .map((word, i) => (
                      <Text
                        key={`${word}_${i}`}
                        style={[
                          Theme.typography.h2,
                          Styles.go_paper_word,
                          isPaperBlur && Styles.go_paper_blur,
                          paperAnim && Styles[`go_paper_word_${paperAnim}`],
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
          </Pressable>
        </View>
      </Page.Main>

      <Page.CTAs style={Styles.go_ctas}>
        {papersTurn.current !== null &&
        !papersTurn.wordsLeft.length &&
        !papersTurn.passed.length ? (
          <Text numberOfLines={1} style={[Theme.typography.secondary, Theme.utils.center]}>
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
          <Text style={[Theme.typography.body, Theme.utils.center, Styles.go_paper_changing]}>
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

export default MyTurnGo
