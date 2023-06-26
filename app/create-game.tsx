import { Stack, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import { Game } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import { formatSlug } from '@src/utils/formatting'

const i18n = {
  headerTitle: 'New game',
  title: 'Give this party a name',
  description: 'Your friends will use this to join.',
}

const nameMaxSize = 16

export default function CreateGame() {
  const Papers = usePapersContext()
  const [isCreating, setCreating] = useState(false)
  const router = useRouter()
  const [state, setState] = useState({
    gameName: '',
    isInvalid: false,
    errorMsg: '',
    isUnexError: false,
  })
  const hasValidName = !state.isInvalid && state.gameName && state.gameName.length >= 3

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
        setState((state) => ({
          ...state,
          gameName: '',
          isInvalid: false,
        }))
      }
    })
  }, [Papers, isCreating, state.gameName])

  function handleInputChange(gameName: Game['name']) {
    const isInvalid = formatSlug(gameName) !== gameName.toLowerCase()

    setState((state) => ({
      ...state,
      gameName,
      isInvalid,
    }))
  }

  return (
    <Page bannerMsg={state.isUnexError && state.errorMsg}>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: i18n.headerTitle,
          headerLeft: () => (
            <Page.HeaderBtn side="left-close" onPress={() => router.push('/')}>
              Cancel
            </Page.HeaderBtn>
          ),
          headerRight: hasValidName
            ? () => (
                <Page.HeaderBtn side="right" isLoading={isCreating} onPress={submit}>
                  Next
                </Page.HeaderBtn>
              )
            : undefined,
        }}
      />

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

const Styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: 40,
  },
  tip: {
    marginTop: 16,
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 4,
    color: Theme.colors.pink,
    height: 76,
  },
  hintMsg: {
    marginVertical: 16,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: Theme.fontSize.small,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.yellow,
    color: Theme.colors.grayDark,
  },
})
