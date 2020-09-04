import React from 'react'
import PropTypes from 'prop-types'

import * as Analytics from '@constants/analytics.js'

import PapersContext from '@store/PapersContext.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'

import * as Theme from '@theme'

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
      headerTitle: profile.name ? 'Home' : 'Create Profile',
      headerRight: function HBS() {
        return profile.name ? <Page.HeaderBtnSettings /> : null
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
