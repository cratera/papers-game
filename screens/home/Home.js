import React from 'react'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'

// import * as Theme from '@theme'

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const gameId = game?.id

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme({ hiddenBorder: true, hiddenTitle: true }),
      headerTitle: profile.name ? 'Home' : 'Create Profile',
      headerRight: function HBS() {
        return profile.name ? <Page.HeaderBtnSettings /> : null
      },
    })
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
