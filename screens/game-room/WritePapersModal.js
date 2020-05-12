import React from 'react'
import PropTypes from 'prop-types'

import { KeyboardAvoidingView, View, TextInput, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Svg, Path, Rect } from 'react-native-svg'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Modal from '@components/modal'
import Page from '@components/page'

import * as Theme from '@theme'
import Styles from './WritePapersModalStyles.js'

export default function WritePapersModal({ isOpen, onClose }) {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const [words, setLocalWords] = React.useState([])
  // const [textareasHeight, setTextareasHeight] = React.useState({});

  const [errorMsg, setErrorMsg] = React.useState(null)
  const [isSubmiting, setIsSubmiting] = React.useState(false)
  const [paperIndex, setPaperIndex] = React.useState(0)

  const wordsGoal = game.settings.words
  const wordsCount = words.filter(word => !!word).length
  const wordsAreStored = !!game.words && !!game.words[profile.id]

  React.useEffect(() => {
    if (wordsAreStored) {
      onClose()
    }
  }, [wordsAreStored])

  return (
    <Modal visible={isOpen} onClose={onClose}>
      <View style={[Styles.header]}>
        <IconLamp />
        <Text style={[Styles.header_txt, Theme.typography.small, Theme.typography.secondary]}>
          Write down words or expressions familiar to everyone in the game!
        </Text>
      </View>
      <View style={Styles.sliderLabels} aria-label="Papers status">
        <Text>
          {paperIndex + 1} of {wordsGoal} • {wordsCount} {wordsCount === 1 ? 'paper' : 'papers'}{' '}
          filled
        </Text>
      </View>
      <KeyboardAvoidingView behavior="padding" style={Styles.scrollKAV}>
        <ScrollView style={[Styles.slides, Theme.u.scrollSideOffset]}>
          {renderSliders()}
          {errorMsg && <Text style={Styles.sliderLabels}>{errorMsg}</Text>}
        </ScrollView>

        <Page.CTAs style={Styles.ctas} hasOffset>
          {wordsCount !== 10 ? (
            <Button variant="light" onPress={handleClickNext}>
              Next paper
            </Button>
          ) : (
            <Button onPress={handleSubmitClick} isLoading={isSubmiting}>
              All done!! Eheheheh
            </Button>
          )}
        </Page.CTAs>
      </KeyboardAvoidingView>
    </Modal>
  )

  function renderSliders() {
    const papers = []
    for (let i = 0; i < wordsGoal; i++) {
      const isActive = i === paperIndex
      // const height = textareasHeight[i] || '4rem';

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

    // OPTIMIZE - Maybe change state only on blur?
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
      console.warn('WritePapersModal submit error:', error)
      setErrorMsg(`Ups, set papers failed! ${error.message}`)
    }
    setIsSubmiting(false)
  }
}

WritePapersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

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

const IconLamp = () => {
  const color = Theme.colors.primary
  // prettier-ignore
  return (
  <Svg style={Styles.header_icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Rect width="24" height="24" fill="white"/>
    <Path d="M7.34851 10.3703C7.26855 11.8112 7.81518 13.2126 8.84837 14.2148C9.66244 15.0045 10.1293 16.0919 10.1293 17.1982V17.8361C10.1293 18.5135 10.6803 19.0645 11.3577 19.0645H13.2522C13.9296 19.0645 14.4805 18.5135 14.4805 17.8361V17.1987C14.4805 16.0783 14.9357 15.002 15.7294 14.2457C16.7224 13.2995 17.2692 12.0233 17.2692 10.6522C17.2692 7.91472 15.0423 5.68775 12.3048 5.68775C12.118 5.68775 11.9283 5.69814 11.741 5.71892C9.36948 5.98117 7.4811 7.9809 7.34851 10.3703ZM11.8404 6.61703C11.9949 6.59986 12.1512 6.59128 12.305 6.59128C14.5442 6.59128 16.3659 8.41279 16.3659 10.6522C16.3659 11.7737 15.9187 12.8175 15.1064 13.5916C14.1347 14.5175 13.5772 15.8321 13.5772 17.1987V17.8361C13.5772 18.0153 13.4313 18.1609 13.2524 18.1609H11.3579C11.1788 18.1609 11.0331 18.015 11.0331 17.8361V17.1982C11.0331 15.849 10.4661 14.5254 9.47767 13.5663C8.63265 12.7466 8.1854 11.5998 8.25091 10.4204C8.35911 8.46632 9.90233 6.83139 11.8404 6.61703Z" fill={color}/>
    <Path d="M12.3051 7.82685C12.9814 7.82685 13.6363 8.07058 14.149 8.51331C14.2132 8.56865 14.2918 8.59576 14.3704 8.59576C14.4655 8.59576 14.5599 8.556 14.627 8.4783C14.7494 8.33667 14.7336 8.12276 14.592 8.00033C13.9561 7.45144 13.1441 7.14898 12.3051 7.14898C12.1179 7.14898 11.9663 7.30055 11.9663 7.48781C11.9663 7.67506 12.1179 7.82685 12.3051 7.82685Z" fill={color}/>
    <Path d="M15.1305 10.6522C15.1305 10.8394 15.2821 10.991 15.4693 10.991C15.6566 10.991 15.8082 10.8394 15.8082 10.6522C15.8082 10.2192 15.7295 9.79608 15.5746 9.39447C15.5073 9.22008 15.3114 9.13335 15.1366 9.20043C14.962 9.26775 14.875 9.46404 14.9426 9.63842C15.0673 9.96188 15.1305 10.303 15.1305 10.6522Z" fill={color}/>
    <Path d="M13.7752 19.5106H10.8347C10.6474 19.5106 10.4958 19.6622 10.4958 19.8494C10.4958 20.0367 10.6474 20.1882 10.8347 20.1882H13.7754C13.9627 20.1882 14.1143 20.0367 14.1143 19.8494C14.1143 19.6622 13.9625 19.5106 13.7752 19.5106Z" fill={color}/>
    <Path d="M14.114 20.9201C14.114 20.7328 13.9625 20.5813 13.7752 20.5813H10.8347C10.6474 20.5813 10.4958 20.7328 10.4958 20.9201C10.4958 21.1073 10.6474 21.2589 10.8347 21.2589H13.7754C13.9625 21.2589 14.114 21.1071 14.114 20.9201Z" fill={color}/>
    <Path d="M4.33882 9.96618C4.15157 9.96618 4 10.1177 4 10.305C4 10.4923 4.15157 10.6438 4.33882 10.6438H6.29112C6.47838 10.6438 6.62994 10.4923 6.62994 10.305C6.62994 10.1177 6.47838 9.96618 6.29112 9.96618H4.33882Z" fill={color}/>
    <Path d="M20.2713 10.6438C20.4586 10.6438 20.6102 10.4923 20.6102 10.305C20.6102 10.1177 20.4586 9.96618 20.2713 9.96618H18.319C18.1318 9.96618 17.9802 10.1177 17.9802 10.305C17.9802 10.4923 18.1318 10.6438 18.319 10.6438H20.2713Z" fill={color}/>
    <Path d="M11.9663 2.33882V4.29112C11.9663 4.47838 12.1179 4.62994 12.3051 4.62994C12.4924 4.62994 12.644 4.47838 12.644 4.29112V2.33882C12.644 2.15157 12.4924 2 12.3051 2C12.1179 2 11.9663 2.15157 11.9663 2.33882Z" fill={color}/>
    <Path d="M16.7971 6.29198L18.1775 4.91161C18.3099 4.77947 18.3099 4.56466 18.1775 4.43252C18.0451 4.30015 17.8308 4.30015 17.6984 4.43252L16.318 5.81288C16.1857 5.94502 16.1857 6.15984 16.318 6.29198C16.3842 6.35816 16.4709 6.39114 16.5577 6.39114C16.6444 6.39114 16.7309 6.35816 16.7971 6.29198Z" fill={color}/>
    <Path d="M7.81289 14.318L6.43253 15.6984C6.30016 15.8305 6.30016 16.0451 6.43253 16.1775C6.49871 16.2437 6.58545 16.2766 6.67219 16.2766C6.75893 16.2766 6.84567 16.2437 6.91185 16.1775L8.29221 14.7971C8.42458 14.665 8.42458 14.4504 8.29221 14.318C8.15985 14.1857 7.94526 14.1857 7.81289 14.318Z" fill={color}/>
    <Path d="M6.91162 4.43252C6.77926 4.30015 6.56489 4.30015 6.43253 4.43252C6.30016 4.56466 6.30016 4.77947 6.43253 4.91161L7.81289 6.29198C7.87907 6.35816 7.96581 6.39114 8.05255 6.39114C8.13929 6.39114 8.22603 6.35816 8.29221 6.29198C8.42458 6.15984 8.42458 5.94502 8.29221 5.81288L6.91162 4.43252Z" fill={color}/>
    <Path d="M16.318 14.318C16.1857 14.4504 16.1857 14.665 16.318 14.7971L17.6984 16.1775C17.7646 16.2437 17.8513 16.2766 17.9381 16.2766C18.0248 16.2766 18.1115 16.2437 18.1777 16.1775C18.3101 16.0451 18.3101 15.8305 18.1777 15.6984L16.7973 14.318C16.6648 14.1857 16.4504 14.1857 16.318 14.318Z" fill={color}/>
    <Path d="M13.3789 21.9905C13.3789 21.8033 13.2273 21.6517 13.04 21.6517H11.5698C11.3825 21.6517 11.231 21.8033 11.231 21.9905C11.231 22.1778 11.3825 22.3294 11.5698 22.3294H13.04C13.2273 22.3294 13.3789 22.1778 13.3789 21.9905Z" fill={color}/>
  </Svg>
  )
}
