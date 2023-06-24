import { Stack, useRouter } from 'expo-router'
import React from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SvgProps } from 'react-native-svg'

import Button from '@src/components/button'
import IllustrationPersonCalling from '@src/components/illustrations/PersonCalling'
import IllustrationPersonGroup from '@src/components/illustrations/PersonGroup'
import IllustrationPersonGuess from '@src/components/illustrations/PersonGuess'
import IllustrationPersonThink from '@src/components/illustrations/PersonThink'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import * as Theme from '@src/theme'
import { window } from '@src/utils/device'

const { vw } = window

type TutorialConfig = {
  title: string
  detail: string | (() => JSX.Element)
  Illustration: (props: SvgProps) => JSX.Element
}

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

export default function Tutorial() {
  const refSlider = React.useRef<ScrollView>(null)
  const [stepIndex, setStepIndex] = React.useState(0)
  const router = useRouter()
  const { state } = usePapersContext()

  React.useEffect(() => {
    // Ensure slides is scrolled at the right position
    refSlider.current?.scrollTo({ x: vw * 100 * stepIndex })
  }, [stepIndex])

  function handleOnStart() {
    if (state.profile?.name) {
      router.push('/')
    } else {
      router.push('create-profile')
    }
  }

  return (
    <Page bgFill="bg">
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Tutorial',
          headerLeft: () => (
            <Page.HeaderBtn side="left-close" onPress={router.back}>
              Close
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main>
        <ScrollView
          ref={refSlider}
          pagingEnabled
          horizontal
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

type TutorialStepProps = {
  isActive: boolean
  ix: number
  stepTotal: number
}

const TutorialStep = ({ isActive, ix, stepTotal }: TutorialStepProps) => {
  const Illustration = tutorialConfig[ix].Illustration
  const Detail = tutorialConfig[ix].detail
  return (
    <View style={[Styles.step, isActive && Styles.step_isActive]}>
      <View style={Styles.media}>
        <Illustration style={Styles.illustration} />
      </View>
      <View style={Styles.content}>
        <Text
          style={[Theme.typography.small, Theme.utils.center, ix === 0 && Theme.utils.invisible]}
        >
          Step {ix} out of {stepTotal - 1}
        </Text>

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

const Styles = StyleSheet.create({
  slides: {
    paddingHorizontal: 0,
  },
  step: {
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    marginBottom: 100,
  },
  step_isActive: {},
  media: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  illustration: {
    width: 60 * vw,
    height: 90 * vw,
    flexGrow: 1,
  },
  content: {
    marginTop: 24,
    minHeight: 150, // ~4 lines iphone 5
  },
  ctas: {},
  hightlight: {
    color: Theme.colors.pink,
  },
  web_left_margin: {
    width: 1,
  },
})
