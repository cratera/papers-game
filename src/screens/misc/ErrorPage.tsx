import React from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { StyleSheet, Text, View } from 'react-native'

import * as Sentry from '@src/services/sentry'

import Button from '@src/components/button'
import { IconSpin } from '@src/components/icons'
import Page from '@src/components/page'
import * as Theme from '@src/theme'
import { ErrorBoundaryProps } from 'expo-router'
import { useEffectOnce } from 'usehooks-ts'

const AUTO_RELOAD = !__DEV__

export default function ErrorCrashed({ error, retry }: ErrorBoundaryProps) {
  const [recoverFailed, setRecoverFailed] = React.useState(false)

  useEffectOnce(() => {
    Sentry.captureException(error, { tags: { pp_page: 'crash_0' } })

    if (AUTO_RELOAD) {
      setTimeout(async () => {
        tryRecover()
      }, 2500) // Time to user read the page text...
    }
  })

  async function checkRecoverAttempt() {
    // Excuse my code. Not having a good morning.
    let attempt = 0
    try {
      attempt = Number(await AsyncStorage.getItem('recover_attempt')) || 0
      console.log('Recovering attempt nr:', attempt)

      if (attempt < 3) {
        await AsyncStorage.setItem('recover_attempt', (+attempt + 1).toString())
      } else {
        setRecoverFailed(true)
        return false
      }
    } catch {
      setRecoverFailed(true)
      return false
    }
    return true
  }

  async function tryRecover() {
    const canReload = await checkRecoverAttempt()
    if (canReload) {
      retry()
    }
  }

  async function deleteAndReload() {
    // No need to delete the other profile keys, they are not relevant, I hope
    await AsyncStorage.removeItem('profile_gameId')
    await AsyncStorage.removeItem('recover_attempt')
    retry()
  }

  return (
    <Page>
      <Page.Main>
        <View style={Styles.container}>
          <Text style={[Theme.typography.h1, Theme.utils.center]}>😵</Text>
          <Text
            style={[
              Theme.typography.h3,
              Theme.utils.center,
              Theme.spacing.mt_24,
              Theme.spacing.mb_8,
            ]}
          >
            Ouch!
          </Text>

          <Text style={Theme.typography.secondary}>Something is not right, our head hurts.</Text>
          <Text
            style={[
              Theme.typography.small,
              Theme.spacing.mt_8,
              Theme.spacing.mb_32,
              Styles.small_text,
            ]}
          >
            {recoverFailed
              ? "We couldn't fix your game automatically."
              : 'Hang in there, this will be quick!'}
          </Text>
          {recoverFailed ? (
            <>
              <Button onPress={deleteAndReload}>Go to homepage</Button>
              <Text style={[Theme.typography.small, Theme.spacing.mt_8]}>
                Your game seems to be corrupted.
              </Text>
            </>
          ) : !AUTO_RELOAD ? (
            <>
              <Text
                style={[
                  Theme.typography.small,
                  Theme.spacing.mt_8,
                  Theme.spacing.mb_24,
                  Styles.error_text,
                ]}
              >
                {error.message}
              </Text>
              <Button variant="light" onPress={tryRecover}>
                Reload game
              </Button>
            </>
          ) : (
            <IconSpin size={24} />
          )}
        </View>
      </Page.Main>
    </Page>
  )
}

const Styles = StyleSheet.create({
  container: {
    marginTop: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  small_text: {
    fontSize: 12,
  },
  error_text: {
    fontSize: 10,
  },
})
