import PropTypes from 'prop-types'
import React from 'react'

import { Text, TextInput, View } from 'react-native'

import { formatSlug } from '@src/utils/formatting'

import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import PapersContext from '@src/store/PapersContext'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Game } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import Styles from './AccessGame.styles'

const i18n = {
  headerTitle: 'Join',
  nameLabel: 'Enter the party name',
  codeLabel: 'Access code',
  cta: 'Join',
}

export default function JoinGame({
  navigation,
}: Pick<StackScreenProps<AppStackParamList, 'access-game'>, 'navigation'>) {
  const Papers = React.useContext(PapersContext)
  const [isJoining, setJoining] = React.useState(false)
  const [didAutoJoin, setDidAutoJoin] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [state, setState] = React.useState({
    gameName: '',
    code: '',
    codePretty: '',
    isInvalid: false,
    errorMsg: '',
    isUnexError: false,
  })

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: i18n.headerTitle,
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
    const has4DigitsCode = state.code.length === 4
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
                <Page.HeaderBtn
                  side="left"
                  onPress={() => {
                    setState((state) => ({
                      ...state,
                      errorMsg: '',
                    }))
                    setStep(0)
                  }}
                >
                  Back
                </Page.HeaderBtn>
              )
            },
      headerRight:
        step === 0 && hasValidName
          ? function Next() {
              return (
                <Page.HeaderBtn side="right" onPress={() => setStep(1)}>
                  Next
                </Page.HeaderBtn>
              )
            }
          : step === 1 && hasValidCode
          ? function Join() {
              return (
                <Page.HeaderBtn side="right" onPress={submit} isLoading={isJoining}>
                  Join
                </Page.HeaderBtn>
              )
            }
          : undefined,
    })

    if (hasValidCode && !isJoining && !didAutoJoin) {
      // use didAutoJoin to avoid retry autoJoin in case of failure
      console.log('auto joining...')
      submit()
    }
  }, [step, state.gameName, state.code, didAutoJoin, isJoining])

  return (
    <Page bannerMsg={state.isUnexError && state.errorMsg}>
      <Page.Main>
        <View>
          {isJoining ? (
            <LoadingBadge variant="page">Joining game</LoadingBadge>
          ) : (
            // TODO: check if it still works as expected. Previously -> <View keyboardShouldPersistTaps="always">
            <View>
              {step === 0 ? (
                <>
                  <Text style={[Styles.title, Theme.typography.body]}>{i18n.nameLabel}</Text>
                  <TextInput
                    key="name"
                    style={[Theme.typography.h2, Styles.input]}
                    inputAccessoryViewID="name"
                    nativeID="inputNameLabel"
                    autoFocus
                    autoCorrect={false}
                    defaultValue={state.gameName}
                    onChangeText={handleNameChange}
                  />
                </>
              ) : (
                <>
                  <Text style={[Styles.title, Theme.typography.h3]}>{i18n.codeLabel}</Text>
                  <View style={Styles.code} accessibilityLabel={`Code: ${state.code}`}>
                    {[0, 0, 0, 0].map((c, index) => (
                      <View key={index} style={Styles.code}>
                        <Text style={[Theme.typography.h1, Styles.code_maskDigit]}>
                          {state.code[index] || (
                            <Text style={[Theme.typography.h1, Styles.code_maskPlaceholder]}>
                              *
                            </Text>
                          )}
                        </Text>
                        {index < 3 && <Text style={[Theme.typography.h1]}>・</Text>}
                      </View>
                    ))}
                    <TextInput
                      key="code"
                      style={[Theme.typography.h1, Styles.code_input]}
                      placeholder="4 digits"
                      placeholderTextColor={Theme.colors.grayLight}
                      keyboardType="number-pad"
                      inputAccessoryViewID="code"
                      nativeID="inputCodeName"
                      autoFocus
                      autoCorrect={false}
                      maxLength={4}
                      defaultValue={state.code}
                      onChangeText={handleCodeChange}
                      caretHidden
                    />
                  </View>
                  {/* <Text>{state.code}</Text> */}
                </>
              )}

              {state.errorMsg && !state.isUnexError && (
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <Text style={[Theme.typography.small, Styles.hintMsg, Styles.errorMsg]}>
                    {state.errorMsg || 'hello error'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Page.Main>
    </Page>
  )

  function handleNameChange(gameName: Game['name']) {
    if (isJoining) {
      return false
    }

    setState((state) => ({
      ...state,
      gameName,
    }))
  }

  function handleCodeChange(code: string) {
    setState((state) => ({
      ...state,
      code,
    }))
  }

  function submit() {
    if (isJoining) {
      return
    }

    setDidAutoJoin(true)
    setJoining(true)
    setState((state) => ({ ...state, errorMsg: '' }))

    const gameSlugged = formatSlug(state.gameName)
    const gameId = `${gameSlugged}_${state.code}`

    Papers.accessGame('join', gameId, (_, errorMsg, opts) => {
      if (errorMsg) {
        setJoining(false)
        setState((state) => ({
          ...state,
          errorMsg,
          isUnexError: Boolean(opts?.isUnexError),
        }))
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
