import React from 'react'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import Page from '@components/page'
import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'

import * as Theme from '@theme'

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const gameId = game?.id

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: profile.name ? 'Home' : 'Create Profile',
      headerLeft: null,
      headerRight: function HBS() {
        return profile.name ? <Page.HeaderBtnSettings /> : null
      },
      // TODO: Define header styles
      headerTintColor: Theme.colors.bg,
      headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
        // height: 72, // REVIEW @mmbotelho
      },
    })
  }, [profile.name])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId])

  function handleUpdateProfile(profile) {
    // Do this here to take advatange of hooks!
    Papers.updateProfile(profile)
  }

  return !profile.name ? (
    <HomeSignup onSubmit={handleUpdateProfile} navigation={navigation} />
  ) : (
    <HomeSigned navigation={navigation} />
  )
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    setOptions: PropTypes.func, // (componentName: String)
    navigate: PropTypes.func, // (componentName: String)
  }),
}
