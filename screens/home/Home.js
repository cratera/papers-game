import React from 'react'
import PropTypes from 'prop-types'

import * as Analytics from '@constants/analytics.js'
import Sentry from '@constants/Sentry'

import PapersContext from '@store/PapersContext.js'

import HomeSigned from './HomeSigned.js'
import HomeSignup from './HomeSignup.js'
import Tutorial from '../tutorial'

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const [isTutorialDone, setIsTutorialDone] = React.useState(false)
  const gameId = game?.id

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Analytics.setCurrentScreen(profile.name ? 'home' : 'profile_creation')
    })
    return unsubscribe
  }, [navigation])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId])

  React.useEffect(() => {
    // Bug, on mount this is called twice
    Analytics.setCurrentScreen(profile.name ? 'home' : 'profile_creation')
  }, [profile.name])

  async function handleUpdateProfile(profile) {
    try {
      await Papers.updateProfile(profile)
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'UP_0' } })
    }
  }

  if (!isTutorialDone && !profile.name) {
    return <Tutorial isMandatory navigation={navigation} onDone={() => setIsTutorialDone(true)} />
  }

  return !profile.name || !profile.avatar ? (
    <HomeSignup onSubmit={handleUpdateProfile} navigation={navigation} />
  ) : (
    <HomeSigned navigation={navigation} />
  )
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
