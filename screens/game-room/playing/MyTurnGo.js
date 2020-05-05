import React, { Fragment } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import PropTypes from 'prop-types'

import { usePrevious, msToSecPretty } from '@constants/utils'

import Button from '@components/button'
import Page from '@components/page'
// import i18n from '@constants/i18n'
import TurnScore from './TurnScore'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const MyTurnGo = ({
  papersTurn,
  countdownSec,
  togglePaper,
  onFinish,
  getPaperByKey,
  isCount321go,
  initialTimerSec,
  countdown,
  setPaperBlur,
  paperAnim,
  isPaperBlur,
  isPaperChanging,
  onPaperClick,
}) => {
  const [isDone, setIsDone] = React.useState(false) // nowords || timesup
  const papersTurnCurrent = papersTurn?.current
  const stillHasWords =
    papersTurnCurrent !== null || papersTurn.passed.length > 0 || papersTurn.wordsLeft.length > 0
  const doneMsg = !stillHasWords ? 'All papers guessed!' : "Time's up!"
  const prevCountdownSec = usePrevious(countdownSec)

  React.useLayoutEffect(() => {
    // Use prevCountdownSec to avoid a false positive
    // when the component mounts (3, 2, 1...)
    if (countdownSec === 0 && !!prevCountdownSec) {
      setIsDone(true)
      setTimeout(resetIsDone, 1500)
    }
  }, [countdownSec, prevCountdownSec])

  React.useLayoutEffect(() => {
    if (!stillHasWords) {
      setIsDone(true)
      setTimeout(resetIsDone, 1500)
    }
  }, [stillHasWords])

  function resetIsDone() {
    setIsDone(false)
  }

  if (isDone) {
    return (
      <Page.Main>
        <Text style={[Theme.typography.h1, Styles.go_count321, { color: Theme.colors.danger }]}>
          {msToSecPretty(countdown)}
        </Text>
        <Text style={[Theme.typography.h1, Styles.go_done_msg]}>{doneMsg}</Text>
      </Page.Main>
    )
  }

  if (!isDone && (!stillHasWords || countdownSec === 0)) {
    return (
      <TurnScore
        papersTurn={papersTurn}
        onTogglePaper={togglePaper}
        type={!stillHasWords ? 'nowords' : 'timesup'}
        onFinish={onFinish}
        getPaperByKey={getPaperByKey}
      />
    )
  }

  if (isCount321go) {
    return (
      <Page.Main>
        <Text style={[Styles.go_count321, Theme.typography.h1]}>
          {countdownSec - initialTimerSec}
        </Text>
      </Page.Main>
    )
  }

  return (
    <Fragment>
      <Page.Main>
        <View>
          <Text
            style={[
              Theme.typography.h1,
              Styles.go_count321,
              countdown <= 10500 && { color: Theme.colors.danger },
            ]}
          >
            {msToSecPretty(countdown)}
          </Text>
          {/* display paper */}
          <TouchableHighlight
            onPressIn={() => setPaperBlur(false)}
            onPressOut={() => setPaperBlur(true)}
          >
            <View style={[Styles.go_paper, Styles[`go_paper_${paperAnim}`]]}>
              <Text
                style={[
                  Theme.typography.h2,
                  Styles.go_paper_word,
                  isPaperBlur && Styles.go_paper_blur,
                  Styles[`go_paper_word_${paperAnim}`],
                ]}
              >
                {!isPaperBlur
                  ? getPaperByKey(papersTurnCurrent) ||
                    `😱 BUG PAPER 😱 ${papersTurnCurrent} (Click pass)`
                  : `*****`}
              </Text>
              <Text style={Styles.go_paper_key}>{String(papersTurnCurrent)}</Text>
              {isPaperBlur && !isPaperChanging && (
                <Text style={Theme.typography.small}>Press to reveal</Text>
              )}
            </View>
          </TouchableHighlight>
        </View>
        {/* words debug on */}
        <View style={{ display: 'block' }}>
          <Text style={{ fontSize: 10, lineHeight: 10 }}>
            {'\n'} - passed: {papersTurn.passed.join(', ')} {'\n'} - guessed:{' '}
            {papersTurn.guessed.join(', ')} {'\n'} - wordsLeft: {papersTurn.wordsLeft.join(', ')}{' '}
          </Text>
        </View>
      </Page.Main>

      <Page.CTAs hasOffset style={Styles.go_ctas}>
        {!isPaperChanging ? (
          <Fragment>
            <Button variant="success" styleTouch={{ flex: 1 }} onPress={() => onPaperClick(true)}>
              Got it!
            </Button>
            <Text style={{ width: 16 }}>{/* lazyness lvl 99 */}</Text>

            {papersTurn.current !== null &&
            !papersTurn.wordsLeft.length &&
            !papersTurn.passed.length ? (
              <Text
                style={[
                  { flex: 1, textAlign: 'center' },
                  Theme.typography.secondary,
                  Theme.u.center,
                ]}
              >
                Last paper!
              </Text>
            ) : (
              <Button
                variant="primary"
                styleTouch={{ flex: 1 }}
                onPress={() => onPaperClick(false)}
              >
                Pass paper
              </Button>
            )}
          </Fragment>
        ) : (
          <Text style={[Theme.u.center, { flex: 1, lineHeight: 44 }]}>⏳</Text>
        )}
      </Page.CTAs>
    </Fragment>
  )
}

MyTurnGo.propTypes = {
  papersTurn: PropTypes.object.isRequired,

  initialTimerSec: PropTypes.number.isRequired,
  countdown: PropTypes.number.isRequired,
  countdownSec: PropTypes.number.isRequired,
  isCount321go: PropTypes.bool.isRequired,

  togglePaper: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  getPaperByKey: PropTypes.func.isRequired,
  setPaperBlur: PropTypes.func.isRequired,

  paperAnim: PropTypes.oneOf(['gotcha', 'nope']),
  isPaperBlur: PropTypes.bool.isRequired,
  isPaperChanging: PropTypes.bool.isRequired,
  onPaperClick: PropTypes.func.isRequired,
}

export default MyTurnGo
