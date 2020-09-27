import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

import * as Analytics from '@constants/analytics.js'

import PapersContext from '@store/PapersContext.js'

import { headerTheme } from '@navigation/headerStuff.js'

import Avatar from '@components/avatar'
import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'

import * as Theme from '@theme'

function HeaderName({ name, onPress }) /* eslint-disable-line */ {
  return (
    <TouchableOpacity style={{ paddingLeft: 24, paddingBottom: 15 }} onPress={onPress}>
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

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const gameId = game?.id

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.setCurrentScreen(profile.name ? 'home' : 'profile_creation')
    })

    return unsubscribe
  }, [navigation])

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
    // Bug, on mount this is called twice
    Analytics.setCurrentScreen(profile.name ? 'home' : 'profile_creation')
  }, [profile.name])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId])

  function goSettings() {
    navigation.navigate('settings')
  }

  async function handleUpdateProfile(profile) {
    // Do this here to take advatange of hooks!
    try {
      await Papers.updateProfile(profile)
    } catch {
      // hum... later
    }
  }

  return !profile.name ? (
    <HomeSignup onSubmit={handleUpdateProfile} navigation={navigation} />
  ) : (
    <HomeSigned navigation={navigation} />
  )
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
