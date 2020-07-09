import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import { IconSpin } from '@components/icons'
import * as Theme from '@theme'

export default function Gate({ navigation, route }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state
  const profileGameId = profile.gameId || ''
  const goal = route?.params?.goal || 'rejoin' // rejoin || leave

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme({ hiddenTitle: true, hiddenBorder: true }),
    })
  }, [])

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
          paddingTop: 140,
        }}
      >
        <IconSpin size={24} />

        <Text style={[Theme.typography.secondary, { marginTop: 16 }]}>
          {`${goal === 'rejoin' ? 'Rejoining' : 'Leaving'} "${
            profileGameId.split('_')[0]
          }" game...`}
        </Text>
      </Page.Main>
    </Page>
  )
}

Gate.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
  route: PropTypes.object,
}
