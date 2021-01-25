import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, ScrollView } from 'react-native'

import * as Theme from '@theme'

import * as Analytics from '@constants/analytics.js'
import { window } from '@constants/layout'

import Button from '@components/button'
import Page from '@components/page'
import { IconArrow } from '@components/icons'
import IllustrationPersonCalling from '@components/illustrations/PersonCalling.js'
import IllustrationPersonThink from '@components/illustrations/PersonThink.js'
import IllustrationPersonGuess from '@components/illustrations/PersonGuess.js'
import IllustrationPersonGroup from '@components/illustrations/PersonGroup.js'

import Styles from './TutorialStyles.js'

const { vw } = window

const tutorialConfig = [
  {
    title: 'Call your friends',
    detail: 'You need at least 3 more friends',
    bgFill: Theme.colors.purple,
    Illustration: IllustrationPersonCalling,
  },
  {
    title: 'Get creative',
    detail:
      'Write down 10 unique words, sentences, expressions... Keep them secret! Your friends will have to guess these later.',
    bgFill: Theme.colors.orange,
    Illustration: IllustrationPersonThink,
  },
  {
    title: 'Start guessing!',
    detail:
      'Every team gets 1 minute to guess as many papers as they can. but pay attention. Each round has different rules.',
    bgFill: Theme.colors.yellow,
    Illustration: IllustrationPersonGuess,
  },
  {
    title: 'Have fun!',
    detail: 'The main goal is for you and your friends to enjoy yourselves. ',
    bgFill: Theme.colors.green,
    Illustration: IllustrationPersonGroup,
  },
]

const stepTotal = tutorialConfig.length

export default function Tutorial({ navigation }) {
  const refSlider = React.useRef()
  const [stepIndex, setStepIndex] = React.useState(0)

  React.useEffect(() => {
    Analytics.setCurrentScreen('tutorial')
    navigation.setOptions({
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={navigation.goBack}>
            Close
          </Page.HeaderBtn>
        )
      },
    })
  }, [])

  React.useEffect(() => {
    // Ensure slides is scrolled at the right position
    refSlider.current.scrollTo({ x: vw * 100 * stepIndex })
  }, [stepIndex])

  return (
    <Page bgFill={tutorialConfig[stepIndex].bgFill}>
      <Page.Main>
        <ScrollView
          ref={refSlider}
          pagingEnabled
          horizontal
          // scrollEventThrottle={100}
          onMomentumScrollEnd={handleScrollEnd}
          style={[Theme.u.scrollSideOffset, Styles.slides]}
        >
          {renderTutorial()}
        </ScrollView>
      </Page.Main>
      <Page.CTAs>
        <View style={Styles.ctas}>
          <Button
            variant="icon"
            size="lg"
            style={[Styles.ctas_btn]}
            styleTouch={[stepIndex === 0 && Styles.ctas_btn_isHidden]}
            onPress={() => stepIndex !== 0 && handleClickPrev()}
          >
            <IconArrow
              size={20}
              color={Theme.colors.grayDark}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </Button>
          <View style={Styles.status} />

          <Button
            variant="icon"
            size="lg"
            style={Styles.ctas_btn}
            styleTouch={[stepIndex === stepTotal - 1 && Styles.ctas_btn_isHidden]}
            onPress={() => stepIndex !== stepTotal - 1 && handleClickNext()}
          >
            <IconArrow size={20} color={Theme.colors.grayDark} />
          </Button>
        </View>
      </Page.CTAs>
    </Page>
  )

  function renderTutorial() {
    const papers = [
      <View key="ml" style={{ width: 1 }}></View>, // force left margin to work on web
    ]
    for (let i = 0; i < stepTotal; i++) {
      const isActive = i === stepIndex
      papers.push(<TutorialStep key={i} isActive={isActive} ix={i} stepTotal={stepTotal} />)
    }

    return papers
  }

  function handleScrollEnd(e) {
    const { contentOffset, layoutMeasurement } = e.nativeEvent
    const pageIndex = Math.floor(contentOffset.x / layoutMeasurement.width)

    setStepIndex(Math.max(Math.min(stepTotal, pageIndex)), 0)
  }

  function handleClickPrev() {
    setStepIndex(Math.max(0, stepIndex - 1))
  }

  function handleClickNext() {
    setStepIndex(index => index + 1)
  }
}

Tutorial.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ===============

const TutorialStep = ({ isActive, ix, stepTotal }) => {
  const Illustration = tutorialConfig[ix].Illustration
  return (
    <View style={[Styles.step, isActive && Styles.step_isActive]}>
      <View style={Styles.media}>
        <Illustration style={Styles.illustration} />
      </View>

      <Text style={[Theme.typography.small, Theme.u.center]}>
        Step {ix + 1} out of {stepTotal}
      </Text>
      <Text style={[Theme.typography.h3, Theme.u.center, { marginVertical: 8 }]}>
        {tutorialConfig[ix].title}
      </Text>
      <Text style={[Theme.typography.body, Theme.u.center]}>{tutorialConfig[ix].detail}</Text>
    </View>
  )
}

TutorialStep.propTypes = {
  isActive: PropTypes.bool.isRequired,
  ix: PropTypes.number.isRequired,
  stepTotal: PropTypes.number.isRequired,
}
