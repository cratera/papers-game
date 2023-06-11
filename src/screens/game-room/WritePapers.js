import * as Sentry from '@src/services/sentry'
import PropTypes from 'prop-types'
import React from 'react'
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native'

import { analytics as Analytics } from '@src/services/firebase'

import Button from '@src/components/button'
import { IconArrow, IconCheck, IllustrationSmile } from '@src/components/icons'
import Page from '@src/components/page'
import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'
import Styles from './WritePapersStyles.js'

import { isAndroid, window } from '@src/utils/device'

const { vw, vh } = window

export default function WritePapers({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const [words, setLocalWords] = React.useState([])
  const [isOnTutorial, setIsOnTutorial] = React.useState(true)
  const [kbHeight, setkbHeight] = React.useState(null) // kb = keyboard
  const [distanceFromKb, setDistanceFromKb] = React.useState(null)
  const refSlides = React.useRef()
  const refCTAs = React.useRef()

  const [errorMsg, setErrorMsg] = React.useState(null)
  const [isSubmiting, setIsSubmiting] = React.useState(false)
  const [paperIndex, setPaperIndex] = React.useState(0)

  const wordsGoal = game.settings.words
  const wordsCount = words.filter((word) => !!word && !!word.trim()).length
  const wordsAreStored = !!game.words && !!game.words[profile.id]
  const isAllWordsDone = wordsCount === 10

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn
            side="left"
            icon="back"
            onPress={() =>
              isOnTutorial ? navigation.navigate('lobby-joining') : setIsOnTutorial(true)
            }
          >
            Back
          </Page.HeaderBtn>
        )
      },
    })
    Analytics.setCurrentScreen(`game_write_papers`)
  }, [isOnTutorial])

  React.useEffect(() => {
    const onKeyboardDidShow = (e) => {
      const newKbHeight = e.endCoordinates.height
      setkbHeight(newKbHeight)
      setTimeout(() => {})

      refCTAs.current.measure((x, y, ctaW, ctaH, pX, pY) => {
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

  React.useEffect(() => {
    if (wordsAreStored) {
      navigation.navigate('lobby-writing')
    }

    return function closeKb() {
      // In old/slow phones (iPhone5) the keyboard persited (rarely)
      // after changing pages. This will make sure it gets closed.
      Keyboard.dismiss()
    }
  }, [wordsAreStored])

  React.useEffect(() => {
    if (!isOnTutorial) {
      // Ensure slides is scrolled at the right position
      refSlides.current.scrollTo({ x: vw * 100 * paperIndex })
    }
  }, [isOnTutorial, paperIndex])

  function renderPapers() {
    const papers = [
      <View key="ml" style={{ width: 1 }}></View>, // force left margin to work on web
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

  function handleWordChange(word, index) {
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
      setErrorMsg(null)
    }

    try {
      await Papers.setWords(words)
    } catch (e) {
      setErrorMsg(e.message)
    }
    setIsSubmiting(false)
  }

  if (isOnTutorial) {
    return (
      <Page bannerMsg={errorMsg} bgFill="purple">
        <Page.Main headerDivider>
          <View style={[Styles.header]}>
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
      </Page>
    )
  }

  const currentWord = words[paperIndex]
  const isWordValid = currentWord && currentWord.trim()

  return (
    <Page bannerMsg={errorMsg} bgFill="purple">
      <Page.Main headerDivider>
        <View
          behavior="padding"
          style={[
            Styles.scrollKAV,
            {
              opacity: kbHeight !== null ? 1 : 0, // TODO: fadein?
            },
          ]}
        >
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
              <Text style={[Theme.typography.body, Theme.utils.center]}>{paperIndex + 1} / 10</Text>
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
    </Page>
  )
}

WritePapers.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ===============

const SlidePaper = ({ onChange, isActive, onFocus, onSubmit, i }) => {
  const elInput = React.createRef()
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    if (isActive) {
      elInput.current.focus()
    }
  }, [isActive])

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

SlidePaper.propTypes = {
  i: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
