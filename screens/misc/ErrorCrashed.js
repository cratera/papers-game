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
  const [isReadable, setIsReadable] = React.useState(false) // time enough to read the page before reloading app.
  const [isReported, setIsReported] = React.useState(false)
  const [error] = React.useState(JSON.parse(errorStr) || {})

  // REVIEW events analytics prod
  React.useEffect(() => {
    if (!__DEV__) {
      reportCrash()
    }
  }, [])

  React.useEffect(() => {
    setTimeout(() => {
      setIsReadable(true)
    }, 500)
  }, [])

  React.useEffect(() => {
    if (isReported && isReadable) {
      reload()
    }
  }, [isReported, isReadable])

  async function reportCrash() {
    try {
      await logEvent('crash', { message: error.message })
      await AsyncStorage.removeItem('lastError')
      setIsReported(true)
    } catch (e) {}
  }

  async function reload() {
    Updates.reloadAsync()
  }

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
          <Text style={[Theme.typography.small, { fontSize: 10, marginTop: 8, marginBottom: 24 }]}>
            {error.message}
          </Text>
          {__DEV__ ? (
            <>
              <Button variant="light" onPress={reportCrash}>
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
