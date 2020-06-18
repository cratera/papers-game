import React from 'react'
import PropTypes from 'prop-types'

import { AsyncStorage, View, Text } from 'react-native'
import * as Updates from 'expo-updates'

import Page from '@components/page'
import Button from '@components/button'
import { IconSpin } from '@components/icons'
import * as Theme from '@theme'
import { logEvent } from '@store/Firebase.js'

export default function ErrorCrashed({ errorStr }) {
  const [error] = React.useState(JSON.parse(errorStr) || {})

  React.useEffect(() => {
    if (!__DEV__) {
      reportAndReload()
    }
  })

  async function reportAndReload() {
    try {
      await logEvent('crash', { message: error.message })
      await AsyncStorage.removeItem('lastError')
      await Updates.reloadAsync()
    } catch (e) {
      await AsyncStorage.removeItem('lastError')
      await Updates.reloadAsync()
    }
  }

  console.log(error)

  return (
    <Page>
      <Page.Main>
        <View
          style={{ marginTop: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Text style={[Theme.typography.h1, Theme.u.center]}>😵</Text>
          <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 24, marginBottom: 8 }]}>
            Ouch!
          </Text>

          <Text style={[Theme.typography.secondary]}>Something is not right, our head hurts.</Text>
          <Text style={[Theme.typography.small, { fontSize: 12, marginTop: 8, marginBottom: 24 }]}>
            Hang in there, this will be quick!
          </Text>
          {__DEV__ ? (
            <>
              <Button variant="light" onPress={reportAndReload}>
                Report the error and reload app
              </Button>
            </>
          ) : (
            <IconSpin size="20" />
          )}
        </View>
      </Page.Main>
    </Page>
  )
}

ErrorCrashed.propTypes = {
  errorStr: PropTypes.string.isRequired, // Error
}
