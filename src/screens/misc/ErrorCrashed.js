import PropTypes from 'prop-types'
import React from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform, Text, View } from 'react-native'

import * as Updates from 'expo-updates'

import * as Sentry from '@src/services/sentry'

import Button from '@src/components/button'
import { IconSpin } from '@src/components/icons'
import Page from '@src/components/page'
import * as Theme from '@src/theme'

const AUTO_RELOAD = !__DEV__

export default function ErrorCrashed({ error }) {
  const [recoverFailed, setRecoverFailed] = React.useState(false)

  React.useEffect(() => {
    Sentry.captureException(error, { tags: { pp_page: 'crash_0' } })

    if (AUTO_RELOAD) {
      setTimeout(async () => {
        tryRecover()
      }, 2500) // Time to user read the page text...
    }
  }, [])

  async function checkRecoverAttempt() {
    // Excuse my code. Not having a good morning.
    let attempt = 0
    try {
      attempt = (await AsyncStorage.getItem('recover_attempt')) || '0'
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
      reload()
    }
  }

  async function deleteAndReload() {
    // No need to delete the other profile keys, they are not relevant, I hope
    await AsyncStorage.removeItem('profile_gameId')
    await AsyncStorage.removeItem('recover_attempt')
    reload()
  }

  async function reload() {
    if (Platform.OS === 'web') {
      global.location.reload()
    } else {
      try {
        Updates.reloadAsync()
      } catch (e) {
        Sentry.captureException(error, { tags: { pp_page: 'crash_R' } })
      }
    }
  }

  return (
    <Page>
      <Page.Main>
        <View
          style={{ marginTop: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Text style={[Theme.typography.h1, Theme.utils.center]}>😵</Text>
          <Text
            style={[Theme.typography.h3, Theme.utils.center, { marginTop: 24, marginBottom: 8 }]}
          >
            Ouch!
          </Text>

          <Text style={Theme.typography.secondary}>Something is not right, our head hurts.</Text>
          <Text style={[Theme.typography.small, { fontSize: 12, marginTop: 8, marginBottom: 32 }]}>
            {recoverFailed
              ? "We couldn't fix your game automatically."
              : 'Hang in there, this will be quick!'}
          </Text>
          {recoverFailed ? (
            <>
              <Button onPress={deleteAndReload}>Go to homepage</Button>
              <Text style={[Theme.typography.small, { marginTop: 8 }]}>
                Your game seems to be corrupted.
              </Text>
            </>
          ) : !AUTO_RELOAD ? (
            <>
              <Text
                style={[Theme.typography.small, { fontSize: 10, marginTop: 8, marginBottom: 24 }]}
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

ErrorCrashed.defaultProps = {
  error: {},
}

ErrorCrashed.propTypes = {
  error: PropTypes.object.isRequired, // Error
}
