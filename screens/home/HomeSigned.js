import React from 'react'
import PropTypes from 'prop-types'
import { Text, TouchableOpacity } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

import { headerTheme } from '@navigation/headerStuff.js'

import Avatar from '@components/avatar'
import Button from '@components/button'
import Bubbling from '@components/bubbling'
import Page from '@components/page'

function HeaderName({ name, onPress }) /* eslint-disable-line */ {
  return (
    <TouchableOpacity style={{ paddingLeft: 24, paddingBottom: 10 }} onPress={onPress}>
      <Text style={Theme.typography.body}>{name}</Text>
    </TouchableOpacity>
  )
}

function HeaderAvatar({ avatar, onPress }) /* eslint-disable-line */ {
  return (
    <TouchableOpacity style={{ paddingRight: 24, paddingBottom: 15 }} onPress={onPress}>
      <Avatar src={avatar} alt="Settings" />
    </TouchableOpacity>
  )
}

export default function HomeSigned({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme({
        hiddenBorder: true,
        hiddenTitle: true,
        bgColor: Theme.colors.purple,
      }),
      headerLeft: function HBS() {
        return profile.name ? <HeaderName name={profile.name} onPress={goSettings} /> : null
      },
      headerTitle: profile.name ? 'Home' : 'Create Profile',
      headerRight: function HBS() {
        return profile.name ? <HeaderAvatar avatar={profile.avatar} onPress={goSettings} /> : null
      },
    })
  }, [profile.name, profile.avatar])

  function goSettings() {
    navigation.navigate('settings')
  }

  return (
    <Page bgFill={Theme.colors.purple}>
      <Bubbling bgStart={Theme.colors.bg} bgEnd={Theme.colors.purple} />
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
