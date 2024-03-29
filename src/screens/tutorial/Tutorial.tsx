import React from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native'

import * as Theme from '@src/theme'

import { analytics as Analytics } from '@src/services/firebase'
import { window } from '@src/utils/device'

import Button from '@src/components/button'
import IllustrationPersonCalling from '@src/components/illustrations/PersonCalling'
import IllustrationPersonGroup from '@src/components/illustrations/PersonGroup'
import IllustrationPersonGuess from '@src/components/illustrations/PersonGuess'
import IllustrationPersonThink from '@src/components/illustrations/PersonThink'
import Page from '@src/components/page'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { useEffectOnce } from 'usehooks-ts'
import Styles from './Tutorial.styles'
import { TutorialConfig, TutorialStepProps } from './Tutorial.types'

const { vw } = window

const tutorialConfig = [
  {
    title: 'Welcome to Papers!',
    detail:
      'Papers is a game where you compete with your friends. Who guesses the most words, wins!',
    Illustration: IllustrationPersonGroup,
  },
  {
    title: 'Call your friends',
    detail: function Detail() {
      return (
        <Text>
          You need at least <Text style={Styles.hightlight}>4 friends</Text> in total to play the
          game.{' '}
        </Text>
      )
    },
    Illustration: IllustrationPersonCalling,
  },
  {
    title: 'Create your papers',
    detail: function Detail() {
      return (
        <Text>
          Write down <Text style={Styles.hightlight}>10 unique words</Text>, sentences,
          expressions... Keep them secret! Your friends will have to guess these later.
        </Text>
      )
    },
    Illustration: IllustrationPersonThink,
  },
  {
    title: 'Start guessing!',
    detail: function Detail() {
      return (
        <Text>
          Every team gets <Text style={Styles.hightlight}>45 seconds</Text> to guess as many papers
          as they can. But pay attention. Each round has different rules.
        </Text>
      )
    },
    Illustration: IllustrationPersonGuess,
  },
] satisfies TutorialConfig[]

const stepTotal = tutorialConfig.length

export default function Tutorial({
  navigation,
  route,
}: StackScreenProps<AppStackParamList, 'tutorial'>) {
  const refSlider = React.useRef<ScrollView>(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const { isMandatory, onDone } = route.params || {}

  useEffectOnce(() => {
    Analytics.setCurrentScreen('tutorial')
    navigation.setOptions({
      headerLeft: isMandatory
        ? undefined
        : function HLB() {
            return (
              <Page.HeaderBtn side="left-close" onPress={navigation.goBack}>
                Close
              </Page.HeaderBtn>
            )
          },
    })
  })

  React.useEffect(() => {
    // Ensure slides is scrolled at the right position
    refSlider.current?.scrollTo({ x: vw * 100 * stepIndex })
  }, [stepIndex])

  function handleOnStart() {
    if (onDone) {
      onDone()
    } else {
      navigation.goBack()
    }
  }

  return (
    <Page bgFill="bg">
      <Page.Main>
        <ScrollView
          ref={refSlider}
          pagingEnabled
          horizontal
          // scrollEventThrottle={100}
          onMomentumScrollEnd={handleScrollEnd}
          style={[Theme.utils.scrollSideOffset, Styles.slides]}
        >
          {renderTutorial()}
        </ScrollView>
      </Page.Main>
      <Page.CTAs>
        <View style={Styles.ctas}>
          {stepIndex !== stepTotal - 1 ? (
            <Button
              variant="light"
              size="lg"
              onPress={() => stepIndex !== stepTotal - 1 && handleClickNext()}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" size="lg" onPress={handleOnStart}>
              Got it!
            </Button>
          )}
        </View>
      </Page.CTAs>
    </Page>
  )

  function renderTutorial() {
    const papers = [
      <View key="ml" style={Styles.web_left_margin} />, // force left margin to work on web
    ]
    for (let i = 0; i < stepTotal; i++) {
      const isActive = i === stepIndex
      papers.push(<TutorialStep key={i} isActive={isActive} ix={i} stepTotal={stepTotal} />)
    }

    return papers
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement } = e.nativeEvent
    const pageIndex = Math.floor(contentOffset.x / layoutMeasurement.width)

    setStepIndex(Math.max(Math.min(stepTotal, pageIndex), 0))
  }

  function handleClickNext() {
    setStepIndex((index) => index + 1)
  }
}

// ===============

const TutorialStep = ({ isActive, ix, stepTotal }: TutorialStepProps) => {
  const Illustration = tutorialConfig[ix].Illustration
  const Detail = tutorialConfig[ix].detail
  return (
    <View style={[Styles.step, isActive && Styles.step_isActive]}>
      <View style={Styles.media}>
        <Illustration style={Styles.illustration} />
      </View>
      <View style={Styles.content}>
        {
          <Text
            style={[Theme.typography.small, Theme.utils.center, ix === 0 && Theme.utils.invisible]}
          >
            Step {ix} out of {stepTotal - 1}
          </Text>
        }
        <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mv_8]}>
          {tutorialConfig[ix].title}
        </Text>
        <Text style={[Theme.typography.body, Theme.utils.center]}>
          {typeof Detail === 'string' ? Detail : <Detail />}
        </Text>
      </View>
    </View>
  )
}
