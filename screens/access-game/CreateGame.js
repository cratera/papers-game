import React from 'react'
import PropTypes from 'prop-types'

import { KeyboardAvoidingView, Text, TextInput } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'
import Page from '@components/page'
// import Button from '@components/button'
import { headerTheme } from '@navigation/headerStuff.js'
import { slugString } from '@constants/utils.js'

import * as Theme from '@theme'
import Styles from './AccessGameStyles.js'

const copy = {
  headerTitle: 'Create',
  title: 'Give this party a name!',
  description: 'Your friends will use it to join the game.',
}

export default function CreateGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [isCreating, setCreating] = React.useState(false)
  const [state, setState] = React.useState({
    gameName: null,
    isInvalid: false,
    errorMsg: null,
  })
  const hasValidName = !state.isInvalid && state.gameName && state.gameName.length >= 3

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
    // REVIEW - How to use closures in RN
    // https://stackoverflow.com/questions/62038483/react-navigation-access-state-inside-setoptions-headerright-callback
    navigation.setOptions({
      headerRight: hasValidName
        ? function HB() {
            return (
              <Page.HeaderBtn
                side="right"
                icon="next"
                textPrimary
                isLoading={isCreating}
                onPress={submit}
              >
                Add Friends
              </Page.HeaderBtn>
            )
          }
        : null,
    })
  }, [hasValidName, state.gameName, isCreating])

  return (
    <Page>
      <Page.Main>
        <KeyboardAvoidingView
          behavior={'padding'}
          keyboardShouldPersistTaps="always"
          style={{ flex: 1, alignSelf: 'stretch' }}
        >
          {isCreating ? (
            <Text style={[Theme.typography.secondary, Theme.u.center, { marginTop: 150 }]}>
              Creating game...
            </Text>
          ) : (
            <ScrollView>
              <Text style={[Styles.title, Theme.typography.h3]}>{copy.title}</Text>
              <Text nativeID="inputNameLabel" style={[Styles.tip, Theme.typography.secondary]}>
                {copy.description}
              </Text>

              <TextInput
                style={[Theme.typography.h1, Styles.input]}
                inputAccessoryViewID="name"
                autoFocus
                autoCorrect={false}
                nativeID="inputNameLabel"
                onChangeText={handleInputChange}
              />
              <Text
                style={[Theme.typography.small, Styles.hintMsg, state.isInvalid && Styles.errorMsg]}
              >
                You can only use letters and numbers.
              </Text>
              {state.errorMsg && (
                <Text style={[Theme.typography.small, Styles.hintMsg, Styles.errorMsg]}>
                  {state.errorMsg}
                </Text>
              )}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Page.Main>
    </Page>
  )

  function handleInputChange(gameName) {
    const isInvalid = slugString(gameName) !== gameName.toLowerCase()

    setState(state => ({
      ...state,
      gameName,
      isInvalid,
    }))
  }

  function submit() {
    if (isCreating) {
      return
    }

    setCreating(true)
    setState(state => ({ ...state, errorMsg: null }))

    Papers.accessGame('create', state.gameName, (res, err) => {
      if (err) {
        setCreating(false)
        setState(state => ({ ...state, errorMsg: err.message }))
      } else {
        // AccessGame.js will detect the new gameId from PapersContext and do the redirect.
      }
    })
  }

  function goHome() {
    navigation.navigate('home')
  }
}

CreateGame.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
