import React from 'react'
import PropTypes from 'prop-types'
import { Text, TouchableOpacity } from 'react-native'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import Button from '@components/button'
import Bubbling from '@components/bubbling'
import Page from '@components/page'

export default function HomeSigned({ navigation }) {
  return (
    <Page>
      <Bubbling fromBehind bgStart={Theme.colors.bg} bgEnd={Theme.colors.purple} />
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
        <TouchableOpacity
          style={[Styles.CTAtutorial, Theme.u.middle]}
          onPress={() => navigation.navigate('tutorial')}
        >
          <Text style={[Theme.typography.body, Styles.CTAtutorial_text]}>How to play</Text>
        </TouchableOpacity>
      </Page.CTAs>
    </Page>
  )

  function openAccessGameModal(variant) {
    navigation.navigate('access-game', { variant })
  }
}

HomeSigned.propTypes = {
  navigation: PropTypes.object, // reactNavigation
}
