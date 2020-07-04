import React from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import {
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
  TextInput,
  Text,
  ScrollView,
} from 'react-native'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { IconArrow } from '@components/icons'
import { headerTheme } from '@navigation/headerStuff.js'
import * as Theme from '@theme'
import Styles from './WritePapersStyles.js'

const isWeb = Platform.OS === 'web'

const vw = Dimensions.get('window').width / 100 // TODO useDimensions
const vh = Dimensions.get('window').height / 100 // TODO useDimensions

export default function WritePapers({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const [words, setLocalWords] = React.useState([])
  const [keyboardHeight, setKeyboardHeight] = React.useState(0)
  const refSlides = React.useRef()
  const scrollDebounced = React.useRef(debounce(handleScrollPapers, 300)).current

  const [errorMsg, setErrorMsg] = React.useState(null)
  const [isSubmiting, setIsSubmiting] = React.useState(false)
  const [paperIndex, setPaperIndex] = React.useState(0)

  const wordsGoal = game.settings.words
  const wordsCount = words.filter(word => !!word).length
  const wordsAreStored = !!game.words && !!game.words[profile.id]
  const isAllWordsDone = wordsCount === 10

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme(),
      headerTitle: 'Write papers',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn
            side="left"
            icon="back"
            onPress={() => navigation.navigate('lobby-joining')}
          >
            Back
          </Page.HeaderBtn>
        )
      },
    })
  }, [])

  React.useEffect(() => {
    const isMounted = true // TODO avoid a memory leak here caused by isSubmiting (finished)
    if (isAllWordsDone && isMounted) {
      navigation.setOptions({
        headerRight: function HLB() {
          return (
            <Page.HeaderBtn
              side="right"
              textPrimary
              isLoading={isSubmiting}
              onPress={handleSubmitClick}
            >
              Finish
            </Page.HeaderBtn>
          )
        },
      })
    } else {
      navigation.setOptions({
        headerRight: null,
      })
    }
    // Pass words as dependency so that "Finish" has the most recent words on submit.
  }, [isAllWordsDone, words, isSubmiting])

  React.useEffect(() => {
    const onKeyboardDidShow = e => {
      setKeyboardHeight(e.endCoordinates.height)
    }

    Keyboard.addListener('keyboardDidShow', onKeyboardDidShow)
    return () => {
      Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow)
    }
  }, []) // TODO later useKeyboardHeight?

  React.useEffect(() => {
    if (wordsAreStored) {
      navigation.navigate('lobby-writing')
    }

    return function closeKb() {
      // In old/slow phones (iPhone5) the keyboard persited (rarely) after changing
      // pages. This will make sure it gets closed.
      Keyboard.dismiss()
    }
  }, [wordsAreStored])

  React.useEffect(() => {
    // Ensure slides is scrolled at the right position
    refSlides.current.scrollTo({ x: vw * 100 * paperIndex })
  }, [paperIndex])

  return (
    <Page>
      <Page.Main>
        <View style={[Styles.header]}>
          <Text style={[Theme.typography.body, Theme.u.center]}>
            Fill out the words or sentences you want your friends to guess.
          </Text>
        </View>
        <KeyboardAvoidingView behavior="padding" style={Styles.scrollKAV}>
          <ScrollView
            ref={refSlides}
            pagingEnabled
            scrollEventThrottle={500}
            horizontal
            onScroll={e => {
              scrollDebounced(e.nativeEvent.contentOffset.x, paperIndex)
            }}
            style={[
              Theme.u.scrollSideOffset,
              Styles.slides,
              {
                height: 100 * vh - 195 - keyboardHeight, // TODO pixel perfect card height iOS + isWeb
              },
            ]}
          >
            {renderPapers()}
          </ScrollView>

          <Page.CTAs style={Styles.ctas}>
            <Button
              style={[Styles.ctas_btn]}
              styleTouch={[paperIndex === 0 && Styles.ctas_btn_isHidden]}
              variant="icon"
              onPress={handleClickPrev}
            >
              <IconArrow
                size={20}
                color={Theme.colors.bg}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </Button>

            <View style={Styles.status} aria-label="Papers status">
              <Text style={Theme.u.center}>
                {wordsCount} out of {wordsGoal} done
              </Text>
              {errorMsg && (
                <Text style={[Theme.typography.error, { marginTop: 4 }]}>{errorMsg}</Text>
              )}
            </View>

            <Button
              variant="icon"
              style={Styles.ctas_btn}
              styleTouch={[paperIndex === wordsGoal - 1 && Styles.ctas_btn_isHidden]}
              onPress={handleClickNext}
            >
              <IconArrow size={20} color={Theme.colors.bg} />
            </Button>
          </Page.CTAs>
        </KeyboardAvoidingView>
      </Page.Main>
    </Page>
  )

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

  function handleScrollPapers(scrollX, curPaper) {
    const newPaper = Math.round(scrollX / (vw * 100))
    if (curPaper !== newPaper) {
      // console.log('handleScrollPapers - update', newPaper)
      setPaperIndex(newPaper)
    }
  }

  function handleWordChange(word, index) {
    if (typeof word !== 'string') {
      console.warn('Wow, this is not a word!', word)
      return
    }

    const wordsToEdit = [...words]
    wordsToEdit[index] = word

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
    // Find if any submitted paper was left empty
    const firstEmpty = words.findIndex(word => !word)
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
    try {
      await Papers.setWords(words)
    } catch (error) {
      console.warn('WritePapers submit error:', error)
      setErrorMsg(`Ups, set papers failed! ${error.message}`)
    }
    setIsSubmiting(false)
  }
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
      style={[
        Styles.slide,
        (isActive || isFocused) && Styles.slide_isActive,
        isWeb && {
          height: vw * 70 - 16, // ugly workaround
        },
      ]}
      data-slide={i + 1}
    >
      <TextInput
        ref={elInput}
        style={[
          Styles.input,
          Theme.typography.h1,
          (isActive || isFocused) && Styles.input_isActive,
          isWeb && {
            height: '100%',
          },
        ]}
        placeholder={`Paper #${i + 1}`}
        placeholderTextColor={Theme.colors.grayLight}
        blurOnSubmit={false} // onSubmitEnding will handle the focus on the next paper.
        onChangeText={text => onChange(text, i)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmit}
        onFocus={() => {
          onFocus()
          setIsFocused(true)
        }}
        caretHidden
        multiline
        autoCorrect={false}
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
