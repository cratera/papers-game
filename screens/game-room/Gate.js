import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types'

import Sentry from '@constants/Sentry'
import * as Analytics from '@constants/analytics.js'

import PapersContext from '@store/PapersContext.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import Button from '@components/button'
import { IconSpin } from '@components/icons'
import * as Theme from '@theme'

export default function Gate({ navigation, route }) {
  const Papers = React.useContext(PapersContext)
  const [isSlow, setIsSlow] = React.useState(false)

  const { profile } = Papers.state
  const profileGameId = profile.gameId || ''
  const goal = route?.params?.goal || 'rejoin' // rejoin || leave

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme({ hiddenTitle: true, hiddenBorder: true }),
    })

    try {
      Analytics.setCurrentScreen('game_gate', { goal })
    } catch (error) {
      Sentry.captureException(error, { tags: { pp_page: 'gate_0' } })
    }
  }, [])

  React.useEffect(() => {
    const buttonCancel = setTimeout(() => {
      // Taking too long? Try something else.
      setIsSlow(true)
    }, 7500)

    return () => {
      clearInterval(buttonCancel)
    }
  }, [])

  async function handleCancel() {
    try {
      Analytics.logEvent('game_gate_cancel')
      await Papers.abortGameGate()
    } catch (error) {
      Sentry.captureException(error, { tags: { pp_page: 'gate_1' } })
    }
    navigation.navigate('home')
  }

  // Any "side effect" when gate action is completed (join, left, etc...)
  // is handled by the parent GameRoomEntry. Not sure if it's the best approach
  // but it was the approach with less bugs and easier to do redirects.

  return (
    <Page>
      <Page.Main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 200,
        }}
      >
        <IconSpin size={24} />

        <Text style={[Theme.typography.secondary, { marginTop: 16, marginBottom: 40 }]}>
          {`${goal === 'rejoin' ? 'Rejoining' : 'Leaving'} "${
            profileGameId.split('_')[0]
          }" game...`}
        </Text>

        {isSlow ? <Button onPress={handleCancel}>Go to homepage</Button> : null}
      </Page.Main>
    </Page>
  )
}

Gate.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
  route: PropTypes.object,
}
