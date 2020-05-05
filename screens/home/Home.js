import React from 'react'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const gameId = game?.id

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId])

  function handleUpdateProfile(profile) {
    // Do this here to take advatange of hooks!
    Papers.updateProfile(profile)
  }

  return !profile.name ? <HomeSignup onSubmit={handleUpdateProfile} /> : <HomeSigned />
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func, // (componentName: String)
  }),
}
