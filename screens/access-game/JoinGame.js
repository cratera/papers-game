import React from 'react'
import PropTypes from 'prop-types'

import { View, KeyboardAvoidingView, Text, TextInput } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'
import Page from '@components/page'
import { headerTheme } from '@navigation/headerStuff.js'
import { slugString } from '@constants/utils.js'

import * as Theme from '@theme'
import Styles from './AccessGameStyles.js'

const copy = {
  headerTitle: 'Join',
  nameLabel: 'Enter the party name',
  codeLabel: 'Access code',
  cta: 'Join',
}

// Maybe move to utils?
const replaceAt = (string, index, replacement) => {
  return string.substr(0, index) + replacement + string.substr(index + replacement.length)
}
const getDigits = str => {
  const match = str.match(/\d+/g)
  return match ? match.join('') : ''
}

export default function JoinGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [isJoining, setJoining] = React.useState(false)
  const codeDigitRefs = React.useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ])
  const [step, setStep] = React.useState(0) // TODO create router between steps
  const [state, setState] = React.useState({
    gameName: '',
    code: '',
    codePretty: '',
    isInvalid: false,
    errorMsg: null,
  })

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme(),
      headerTitle: copy.headerTitle,
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={goHome}>
            Cancel
          </Page.HeaderBtn>
        )
      },
    })
  }, [])

  React.useEffect(() => {
    const hasValidName = !state.isInvalid && state.gameName && state.gameName.length >= 3
    const has4DigitsCode = getDigits(state.code).length === 4
    const hasValidCode = state.code && has4DigitsCode

    navigation.setOptions({
      headerLeft:
        step === 0
          ? function btnHome() {
              return (
                <Page.HeaderBtn side="left" onPress={goHome}>
                  Cancel
                </Page.HeaderBtn>
              )
            }
          : function btnBack() {
              return (
                <Page.HeaderBtn side="left" icon="back" onPress={() => setStep(0)}>
                  Back
                </Page.HeaderBtn>
              )
            },
      headerRight:
        step === 0 && hasValidName
          ? function Next() {
              return (
                <Page.HeaderBtn side="right" icon="next" textPrimary onPress={() => setStep(1)}>
                  Next
                </Page.HeaderBtn>
              )
            }
          : step === 1 && hasValidCode
          ? function Join() {
              return (
                <Page.HeaderBtn side="right" textPrimary onPress={submit}>
                  Join
                </Page.HeaderBtn>
              )
            }
          : null,
    })
  }, [step, state.gameName, state.code])

  return (
    <Page>
      <Page.Main>
        <KeyboardAvoidingView
          behavior={'padding'}
          keyboardShouldPersistTaps="always"
          style={{ flex: 1, alignSelf: 'stretch' }}
        >
          <ScrollView>
            {step === 0 ? (
              <>
                <Text style={[Styles.title, Theme.typography.h3]}>{copy.nameLabel}</Text>
                <TextInput
                  key="name"
                  style={[Theme.typography.h1, Styles.input]}
                  inputAccessoryViewID="name"
                  autoFocus
                  autoCorrect={false}
                  nativeID="inputNameLabel"
                  defaultValue={state.gameName}
                  onChangeText={handleNameChange}
                />
              </>
            ) : (
              <>
                <Text style={[Styles.title, Theme.typography.h3]}>{copy.codeLabel}</Text>
                <View style={Styles.code}>
                  {[1, 2, 3, 4].map((c, index) => (
                    <View key={index} style={Styles.code}>
                      <TextInput
                        ref={codeDigitRefs.current[index]}
                        style={[Theme.typography.h1, Styles.code_input]}
                        keyboardType="number-pad"
                        inputAccessoryViewID="code"
                        autoFocus={index === 0}
                        autoCorrect={false}
                        placeholder="*"
                        maxLength={1}
                        nativeID="inputCodeName"
                        onChangeText={digit => handleCodeChange(digit, index)}
                        // defaultValue={state.code[index]} // this is buggy when deleting a char
                      />
                      {index < 3 && <Text style={[Theme.typography.h1, Styles.code_mask]}>・</Text>}
                    </View>
                  ))}
                </View>
                <Text>{state.code}</Text>
              </>
            )}

            {state.errorMsg && (
              <Text style={[Theme.typography.small, Styles.hintMsg, Styles.errorMsg]}>
                {state.errorMsg}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Page.Main>
    </Page>
  )

  function handleNameChange(gameName) {
    setState(state => ({
      ...state,
      gameName,
    }))
  }

  function handleCodeChange(digit, index) {
    console.log('codeChange', digit, index)

    setState(state => ({
      ...state,
      code: replaceAt(state.code, index, digit || ' '),
    }))

    if (getDigits(digit) && index < 3) {
      codeDigitRefs.current[index + 1].current.focus()
    }
  }

  function submit() {
    if (isJoining) {
      return
    }

    setJoining(true)
    setState(state => ({ ...state, errorMsg: null }))

    const gameSlugged = slugString(state.gameName)
    const gameId = `${gameSlugged}_${state.code}`

    Papers.accessGame('join', gameId, (res, err) => {
      if (err) {
        setJoining(false)
        setState(state => ({ ...state, errorMsg: err }))
      } else {
        // AccessGame.js will detect the new gameId from PapersContext and do the redirect.
      }
    })
  }

  function goHome() {
    navigation.navigate('home')
  }
}

JoinGame.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
