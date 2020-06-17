import React from 'react'
import PropTypes from 'prop-types'

import { AsyncStorage, View, Text } from 'react-native'
import * as Updates from 'expo-updates'

import Page from '@components/page'
import Button from '@components/button'

import * as Theme from '@theme'
import { logEvent } from '@store/Firebase.js'

export default function ErrorCrashed({ errorStr }) {
  const [error] = React.useState(JSON.parse(errorStr) || {})
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleTryAgain() {
    setIsLoading(true)
    try {
      await logEvent('crash', {
        screen: 'crash',
        message: error.message,
        error: errorStr,
        memo: 'nop',
      })
      await AsyncStorage.removeItem('lastError')
      await Updates.reloadAsync()
    } catch (e) {
      await AsyncStorage.removeItem('lastError')
    }
  }

  return (
    <Page>
      <Page.Main style={{ backgroundColor: Theme.colors.danger }}>
        <View style={{ marginTop: 72 }}>
          <Text style={[Theme.typography.h2, Theme.u.center, { color: Theme.colors.bg }]}>
            Ouch, the app crashed! 🥺
          </Text>

          <Text
            style={[
              Theme.typography.body,
              Theme.u.center,
              { color: Theme.colors.bg, marginTop: 24 },
            ]}
          >
            {error.message}
          </Text>
          <Text
            style={[
              Theme.typography.small,
              Theme.u.center,
              { fontSize: 12, color: Theme.colors.bg, marginBottom: 24 },
            ]}
          >
            {error.componentStack.substring(0, 200)}
          </Text>
          <Button variant="light" isLoading={isLoading} onPress={handleTryAgain}>
            Report the error and reload app
          </Button>
        </View>
      </Page.Main>
    </Page>
  )
}

ErrorCrashed.propTypes = {
  errorStr: PropTypes.string.isRequired, // Error
}
