import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'react-native'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import Page from '@components/page'
import Button from '@components/button'

export default function HomeSigned({ navigation }) {
  return (
    <Fragment>
      <Page bgFill={Theme.colors.purple}>
        <Page.Main headerDivider style={[Styles.main, { justifyContent: 'center' }]}>
          <Text style={[Theme.typography.h1, { marginBottom: 120 }]}>Papers</Text>
        </Page.Main>
        <Page.CTAs>
          <Button onPress={() => openAccessGameModal('create')}>Create Game</Button>
          <Button
            variant="light"
            style={{ marginTop: 16 }}
            onPress={() => openAccessGameModal('join')}
          >
            Join
          </Button>
        </Page.CTAs>
      </Page>
    </Fragment>
  )

  function openAccessGameModal(variant) {
    navigation.navigate('access-game', { variant })
  }
}

HomeSigned.propTypes = {
  navigation: PropTypes.object, // reactNavigation
}
