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

  async function handleTryAgain() {
    await AsyncStorage.removeItem('lastError')
    await logEvent('test', { screen: 'crash', message: error.message, memo: 'Testing this out!' })
    await Updates.reloadAsync()
  }

  return (
    <Page>
      <Page.Main>
        <View style={{ marginTop: 72 }}>
          <Text>Damn! The app just crashed!</Text>
          <Text style={{ fontSize: 12 }}>{error.message}</Text>

          <Button onPress={handleTryAgain}>Report the error and try again</Button>
        </View>
      </Page.Main>
    </Page>
  )
}

ErrorCrashed.propTypes = {
  errorStr: PropTypes.string.isRequired, // Error
}
