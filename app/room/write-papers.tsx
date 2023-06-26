import { Redirect, Stack, useRouter } from 'expo-router'
import { createRef, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native'

import Button from '@src/components/button'
import { IconArrow, IconCheck, IllustrationSmile } from '@src/components/icons'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import * as Sentry from '@src/services/sentry'
import { usePapersContext } from '@src/store/PapersContext'
import * as Theme from '@src/theme'
import { isAndroid, isTamagoshi, isWeb, window } from '@src/utils/device'

const { vw, vh } = window

export default function WritePapers() {
  const router = useRouter()
  const Papers = usePapersContext()
  const { game, profile } = Papers.state
  const [words, setLocalWords] = useState<string[]>([])
  const [isOnTutorial, setIsOnTutorial] = useState(true)
  const [kbHeight, setkbHeight] = useState(0) // kb = keyboard
  const [distanceFromKb, setDistanceFromKb] = useState(0)
  const refSlides = useRef<ScrollView>(null)
  const refCTAs = useRef<View>(null)

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [paperIndex, setPaperIndex] = useState(0)

  const wordsGoal = game?.settings.words || 10
  const wordsCount = words.filter((word) => !!word && !!word.trim()).length
  const wordsAreStored = !!game?.words && profile?.id && !!game?.words[profile.id]
  const isAllWordsDone = wordsCount === 10

  useEffect(() => {
    const onKeyboardDidShow = (e: KeyboardEvent) => {
      const newKbHeight = e.endCoordinates.height
      setkbHeight(newKbHeight)

      refCTAs.current?.measure((x, y, ctaW, ctaH, pX, pY) => {
        const vh100 = vh * 100
        const pYEnd = pY + ctaH
        const space = 16
        const distance = vh100 - (pYEnd + newKbHeight) - space

        setDistanceFromKb(Math.round(distance))
      })
    }

    const KBfallback = setTimeout(() => {
      if (!kbHeight) setkbHeight(0)
    }, 1500)

    // TODO: Prevent kb flickrs. BUG workaround
    if (!kbHeight) {
      Keyboard.addListener('keyboardDidShow', onKeyboardDidShow)
    }
    return () => {
      clearTimeout(KBfallback)
      Keyboard.removeAllListeners('keyboardDidShow')
    }
  }, [kbHeight]) // TODO: later usekbHeight?

  useEffect(() => {
    if (wordsAreStored) {
      router.push('/room/lobby-writing')
    }

    return function closeKb() {
      // In old/slow phones (iPhone5) the keyboard persited (rarely)
      // after changing pages. This will make sure it gets closed.
      Keyboard.dismiss()
    }
  }, [router, wordsAreStored])

  useEffect(() => {
    if (!isOnTutorial) {
      // Ensure slides is scrolled at the right position
      refSlides.current?.scrollTo({ x: vw * 100 * paperIndex })
    }
  }, [isOnTutorial, paperIndex])

  function renderPapers() {
    const papers = [
      <View key="ml" style={Styles.web_left_margin} />, // force left margin to work on web
    ]
    for (let i = 0; i < wordsGoal; i++) {
      const isActive = i === paperIndex

      papers.push(
        <SlidePaper
          key={i}
          isActive={isActive}
          i={i}
          onFocus={() => setPaperIndex(i)}
          onChange={handleWordChange}
          onSubmit={handleClickNext}
        />
      )
    }

    return papers
  }

  function handleWordChange(word: string, index: number) {
    if (typeof word !== 'string') {
      Sentry.withScope((scope) => {
        scope.setExtra('response', JSON.stringify(word))
        Sentry.captureException(Error('handleWordChange - not a word!'))
      })
      return
    }

    const wordsToEdit = [...words]
    wordsToEdit[index] = word.replace(/[\r\n]+/gm, '')

    // Q: Maybe change state only on blur?
    // A: No, parent needs to know the value so "Next paper" works
    // A2: Can change state only +2 words are guessed.
    //     - And use refs to store the words. This is slow in old devices.
    setLocalWords(wordsToEdit)
  }

  function handleClickPrev() {
    setPaperIndex(Math.max(0, paperIndex - 1))
  }

  function handleClickNext() {
    console.log('clicked next')
    // Find if any submitted paper was left empty
    const firstEmpty = words.findIndex((word) => !word)
    // Go to next paper even if current one is empty
    const nextEmpty = firstEmpty === -1 || firstEmpty === paperIndex ? paperIndex + 1 : firstEmpty
    // Watch out to go back to first paper when reaching the end
    const nextPaperIndex = nextEmpty > wordsGoal - 1 ? 0 : nextEmpty
    setPaperIndex(nextPaperIndex)
  }

  async function handleSubmitClick() {
    if (isSubmiting === true) {
      return
    }
    setIsSubmiting(true)
    if (errorMsg) {
      setErrorMsg(undefined)
    }

    try {
      await Papers.setWords(words)
    } catch (e) {
      const error = e as Error

      setErrorMsg(error.message)
    }
    setIsSubmiting(false)
  }

  const currentWord = words[paperIndex]
  const isWordValid = currentWord && currentWord.trim()

  if (!game) {
    return <Redirect href="/room/gate" />
  }

  return (
    <Page bannerMsg={errorMsg} bgFill="purple">
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Write your papers',
          headerLeft: () => {
            return (
              <Page.HeaderBtn
                side="left"
                onPress={() => (isOnTutorial ? router.push('/') : setIsOnTutorial(true))}
              >
                Back
              </Page.HeaderBtn>
            )
          },
        }}
      />

      {isOnTutorial ? (
        <>
          <Page.Main>
            <View style={Styles.header}>
              {/* TODO: use <Card /> */}
              <View style={Styles.slidePlaceholder}>
                <IllustrationSmile />
              </View>
              <Text style={[Theme.typography.h2, Styles.slideTitle, Theme.utils.center]}>
                Time to create your papers!
              </Text>
              <Text style={[Theme.typography.secondary, Theme.utils.center]}>
                Fill out the words or sentences you want your friends to guess.
              </Text>
            </View>
          </Page.Main>

          <Page.CTAs>
            <Button variant="blank" size="lg" onPress={() => setIsOnTutorial(false)}>
              {"Let's do it!"}
            </Button>
          </Page.CTAs>
        </>
      ) : (
        <Page.Main>
          <View style={[Styles.scrollKAV, !!kbHeight && Theme.utils.invisible]}>
            <ScrollView
              ref={refSlides}
              pagingEnabled
              horizontal
              scrollEnabled={false}
              style={[Theme.utils.scrollSideOffset, Styles.slides]}
            >
              {renderPapers()}
            </ScrollView>

            <View style={[Styles.ctas, { marginTop: distanceFromKb }]} ref={refCTAs}>
              <Button
                variant="icon"
                size="lg"
                style={Styles.ctas_btn}
                bgColor={Theme.colors.bg}
                styleTouch={[paperIndex === 0 && Styles.ctas_btn_isHidden]}
                onPress={() => paperIndex !== 0 && handleClickPrev()}
              >
                <IconArrow
                  size={20}
                  color={Theme.colors.grayDark}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </Button>

              <View style={Styles.status}>
                <Text style={[Theme.typography.body, Theme.utils.center]}>
                  {paperIndex + 1} / 10
                </Text>
              </View>

              {paperIndex === wordsGoal - 1 ? (
                <Button
                  variant="icon"
                  size="lg"
                  style={Styles.ctas_btn}
                  bgColor={isAllWordsDone ? Theme.colors.grayDark : Theme.colors.grayLight}
                  onPress={() => isAllWordsDone && handleSubmitClick()}
                >
                  <IconCheck size={20} color={Theme.colors.bg} />
                </Button>
              ) : (
                <Button
                  variant="icon"
                  size="lg"
                  style={Styles.ctas_btn}
                  bgColor={isWordValid ? Theme.colors.bg : Theme.colors.grayLight}
                  onPress={() => isWordValid && handleClickNext()}
                >
                  <IconArrow size={20} color={Theme.colors.grayDark} />
                </Button>
              )}
            </View>
          </View>
        </Page.Main>
      )}
    </Page>
  )
}

// ===============

interface SlidePaperProps {
  i: number
  isActive: boolean
  onChange: (text: string, i: number) => void
  onFocus: EmptyCallback
  onSubmit: TextInputProps['onSubmitEditing']
}

const SlidePaper = ({ onChange, isActive, onFocus, onSubmit, i }: SlidePaperProps) => {
  const elInput = createRef<TextInput>()
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (isActive) {
      elInput.current?.focus()
    }
  }, [elInput, isActive])

  return (
    <View
      style={[Styles.slide, (isActive || isFocused) && Styles.slide_isActive]}
      data-slide={i + 1}
    >
      <TextInput
        ref={elInput}
        style={[
          Theme.typography.h2,
          Styles.input,
          (isActive || isFocused) && Styles.input_isActive,
        ]}
        multiline
        autoCorrect={false}
        keyboardType={isAndroid ? 'visible-password' : 'default'} // Remove Android auto-suggestions
        placeholder={`Paper #${i + 1}`}
        placeholderTextColor={Theme.colors.grayLight}
        blurOnSubmit={true} // prevent new line
        onChangeText={(text) => onChange(text, i)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmit}
        onFocus={() => {
          onFocus()
          setIsFocused(true)
        }}
      ></TextInput>
    </View>
  )
}

const paperHeight = vw * 65

const slideHeight = isTamagoshi ? 50 * vw : 70 * vw

const Styles = StyleSheet.create({
  header: {
    paddingVertical: isTamagoshi ? 8 : 16,
  },
  scrollKAV: {
    opacity: 1,
  },
  slides: {
    height: slideHeight,
    maxHeight: paperHeight + 12,
    paddingHorizontal: 0,
  },
  slidePlaceholder: {
    height: slideHeight,
    backgroundColor: Theme.colors.bg,
    borderRadius: 12,
    padding: 15 * vw,
    marginBottom: 32,
  },
  slideTitle: {
    marginBottom: 16,
  },
  slide: {
    ...(isWeb ? { height: slideHeight - 16 } : {}),
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bg,
    // borderWidth: 2,
    // borderColor: Theme.colors.grayMedium,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 0,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  slide_isActive: {
    borderColor: Theme.colors.grayDark,
  },
  input: {
    borderColor: Theme.colors.transparent,
    color: Theme.colors.grayDark,
    textAlign: 'center',
    ...(isWeb ? { height: '100' /* 2 lines */, fontSize: 28 } : {}),
    ...(isTamagoshi ? { fontSize: 28 } : { fontSize: 36 }),
  },
  input_isActive: {
    // outline: none // not supported. TODO: later, maybe an external stylesheet?...
  },
  status: {
    flexGrow: 1,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  ctas_btn: {
    borderWidth: 0,
  },
  ctas_btn_isHidden: {
    opacity: 0,
    // pointerEvents: 'none',
  },
  web_left_margin: {
    width: 1,
  },
})
