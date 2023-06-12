import React, { useCallback } from 'react'

import { Text, TextInput, View } from 'react-native'

import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import { headerTheme } from '@src/navigation/headerStuff'
import PapersContext from '@src/store/PapersContext'
import { formatSlug } from '@src/utils/formatting'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Game } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import { useEffectOnce } from 'usehooks-ts'
import Styles from './AccessGame.styles'

const i18n = {
  headerTitle: 'New game',
  title: 'Give this party a name',
  description: 'Your friends will use this to join.',
}

const nameMaxSize = 16

export default function CreateGame({
  navigation,
}: Pick<StackScreenProps<AppStackParamList, 'access-game'>, 'navigation'>) {
  const Papers = React.useContext(PapersContext)
  const [isCreating, setCreating] = React.useState(false)
  const [state, setState] = React.useState({
    gameName: '',
    isInvalid: false,
    errorMsg: '',
    isUnexError: false,
  })
  const hasValidName = !state.isInvalid && state.gameName && state.gameName.length >= 3

  useEffectOnce(() => {
    navigation.setOptions({
      ...headerTheme(),
      headerTitle: i18n.headerTitle,
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={goHome}>
            Cancel
          </Page.HeaderBtn>
        )
      },
    })
  })

  const submit = useCallback(() => {
    if (isCreating) {
      return
    }

    setCreating(true)
    setState((state) => ({ ...state, errorMsg: '' }))

    Papers.accessGame('create', state.gameName, (_, errorMsg, opts) => {
      if (errorMsg) {
        setCreating(false)
        setState((state) => ({
          ...state,
          errorMsg,
          isUnexError: Boolean(opts?.isUnexError),
        }))
      } else {
        // AccessGame.js will detect the new gameId from PapersContext and do the redirect.
      }
    })
  }, [Papers, isCreating, state.gameName])

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: hasValidName
        ? function HB() {
            return (
              <Page.HeaderBtn side="right" isLoading={isCreating} onPress={submit}>
                Next
              </Page.HeaderBtn>
            )
          }
        : undefined,
    })
  }, [hasValidName, state.gameName, isCreating, navigation, submit])

  function handleInputChange(gameName: Game['name']) {
    const isInvalid = formatSlug(gameName) !== gameName.toLowerCase()

    setState((state) => ({
      ...state,
      gameName,
      isInvalid,
    }))
  }

  function goHome() {
    navigation.navigate('home')
  }

  return (
    <Page bannerMsg={state.isUnexError && state.errorMsg}>
      <Page.Main>
        <View>
          {isCreating ? (
            <LoadingBadge variant="page">Creating game</LoadingBadge>
          ) : (
            <>
              <Text style={[Styles.title, Theme.typography.h3]}>{i18n.title}</Text>

              <TextInput
                style={[Theme.typography.h2, Styles.input]}
                inputAccessoryViewID="name"
                autoFocus
                autoCorrect={false}
                nativeID="inputNameLabel"
                defaultValue={state.gameName}
                placeholder="Choose a name..."
                placeholderTextColor={Theme.colors.grayLight}
                maxLength={nameMaxSize}
                onChangeText={handleInputChange}
              />
              {state.isInvalid && (
                <Text style={[Theme.typography.small, Styles.hintMsg, Styles.errorMsg]}>
                  You can only use letters and numbers.
                </Text>
              )}
              {state.errorMsg && !state.isUnexError && (
                <Text style={[Theme.typography.small, Styles.hintMsg, Styles.errorMsg]}>
                  {state.errorMsg}
                </Text>
              )}
              <View style={Styles.tip}>
                <Text nativeID="inputNameLabel" style={Theme.typography.small}>
                  {i18n.description}
                </Text>
                <Text
                  nativeID="inputNameLabel"
                  style={[
                    Theme.typography.small,
                    state.gameName.length === nameMaxSize && {
                      color: Theme.colors.danger,
                    },
                  ]}
                >
                  {state.gameName.length} / {nameMaxSize}
                </Text>
              </View>
            </>
          )}
        </View>
      </Page.Main>
    </Page>
  )
}
