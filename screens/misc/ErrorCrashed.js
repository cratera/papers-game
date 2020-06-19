import React from 'react'
import PropTypes from 'prop-types'

import { Platform, View, Text } from 'react-native'
import * as Updates from 'expo-updates'
// import * as ErrorRecovery from 'expo-error-recovery'

import Page from '@components/page'
import Button from '@components/button'
import { IconSpin } from '@components/icons'
import * as Theme from '@theme'

const AUTO_RELOAD = true // __DEV__

export default function ErrorCrashed({ error, errorTry }) {
  React.useEffect(() => {
    if (AUTO_RELOAD) {
      setTimeout(() => {
        Updates.reloadAsync()
      }, 2500) // Time to user read the page text...
    }
  }, [])

  async function reload() {
    // CONTINUE HERE - Mark this reload count. If +3 force a fatal Error.
    // ErrorRecovery.setRecoveryProps({ errorTry: errorTry + 1 })

    if (Platform.OS === 'web') {
      global.location.reload()
    } else {
      Updates.reloadAsync()
    }
  }

  return (
    <Page>
      <Page.Main>
        <View
          style={{ marginTop: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Text style={[Theme.typography.h1, Theme.u.center]}>😵</Text>
          <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 24, marginBottom: 8 }]}>
            Ouch! {this.props.errorTry}
          </Text>

          <Text style={[Theme.typography.secondary]}>Something is not right, our head hurts.</Text>
          <Text style={[Theme.typography.small, { fontSize: 12, marginTop: 8, marginBottom: 32 }]}>
            Hang in there, this will be quick!
          </Text>
          {!AUTO_RELOAD ? (
            <>
              <Text
                style={[Theme.typography.small, { fontSize: 10, marginTop: 8, marginBottom: 24 }]}
              >
                {error.message}
              </Text>
              <Button variant="light" onPress={reload}>
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

ErrorCrashed.propTypes = {
  errorTry: PropTypes.number,
  error: PropTypes.object.isRequired, // Error
}
