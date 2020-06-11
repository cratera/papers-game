import React from 'react'
import PropTypes from 'prop-types'

import { KeyboardAvoidingView, View, TextInput, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { headerTheme } from '@navigation/headerStuff.js'

import * as Theme from '@theme'
import Styles from './WritePapersStyles.js'

export default function WritePapers({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const [words, setLocalWords] = React.useState([])

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
    if (isAllWordsDone) {
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
    if (wordsAreStored) {
      navigation.navigate('lobby-writing')
    }
  }, [wordsAreStored])

  return (
    <Page>
      <Page.Main>
        <View style={[Styles.header]}>
          <Text style={[Styles.header_txt, Theme.typography.small, Theme.typography.secondary]}>
            Fill out the words or sentences you want your friends to guess.
          </Text>
        </View>
        <View style={Styles.sliderLabels} aria-label="Papers status">
          <Text>
            {paperIndex + 1} of {wordsGoal} • {wordsCount} {wordsCount === 1 ? 'paper' : 'papers'}{' '}
            filled
          </Text>
          {errorMsg && <Text style={[Theme.typography.error, { marginTop: 4 }]}>{errorMsg}</Text>}
        </View>

        <KeyboardAvoidingView behavior="padding" style={Styles.scrollKAV}>
          <ScrollView style={[Styles.slides, Theme.u.scrollSideOffset]}>
            {renderSliders()}
          </ScrollView>
          <Page.CTAs style={{ paddingBottom: 80, paddingHorizontal: 0 }} hasOffset>
            {!isAllWordsDone && (
              <Button variant="light" onPress={handleClickNext}>
                Next paper
              </Button>
            )}
          </Page.CTAs>
        </KeyboardAvoidingView>
      </Page.Main>
    </Page>
  )

  function renderSliders() {
    const papers = []
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
      console.warn('Wow, this is not a word!', word)
      return
    }

    const wordsToEdit = [...words]
    wordsToEdit[index] = word

    // Q: Maybe change state only on blur?
    // A: No, parent needs to know the value so "Next paper" works
    setLocalWords(wordsToEdit)
  }

  function handleClickNext() {
    // Find if any submitted paper was left empty
    const firstEmpty = words.findIndex(word => !word)
    // Go to next paper even if current one is empty
    const nextEmpty = firstEmpty === -1 || firstEmpty === paperIndex ? paperIndex + 1 : firstEmpty
    // Watch out to go back to first paper when reaching the end
    setPaperIndex(nextEmpty > wordsGoal - 1 ? 0 : nextEmpty)
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
    <View style={[Styles.slide]} data-slide={i + 1}>
      <TextInput
        ref={elInput}
        style={[Styles.input, (isActive || isFocused) && Styles.input_isActive]}
        placeholderTextColor={Theme.colors.grayMedium}
        blurOnSubmit={false} // onSubmitEnding will handle the focus on the next paper.
        onChangeText={text => onChange(text, i)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmit}
        onFocus={() => {
          onFocus()
          setIsFocused(true)
        }}
        enablesReturnKeyAutomatically
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
