import React from 'react'
import PropTypes from 'prop-types'
// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import { createStackNavigator } from '@react-navigation/stack'
import PapersContext from '@store/PapersContext.js'
import Gate from './Gate'
import LobbyJoining from './LobbyJoining.js'
import Teams from './Teams.js'
import WritePapers from './WritePapers'
import LobbyWriting from './LobbyWriting.js'
import Playing from './playing/PlayingEntry'

const Stack = createStackNavigator()

export default function GameRoomEntry({ navigation, route }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const hasGameIdCached = React.useRef(!!profile.gameId).current
  const profileId = profile.id
  const profileGameId = profile.gameId

  const { id: gameId } = game || {}

  const wordsAreStored = !!game?.words?.[profileId]
  const amIReady = !!game?.players[profileId]?.isReady
  const isPlaying = game?.hasStarted || amIReady

  React.useEffect(() => {
    if (!profileId) {
      // TODO later - info the profile is needed first.
      navigation.navigate('home')
    }
  }, [profileId])

  React.useEffect(() => {
    // Player left / was kicked, or game was deleted, etc...
    if (!profileGameId && !game) {
      navigation.navigate('home')
    }
  }, [profileGameId, game])

  React.useEffect(() => {
    // Loaded cached game with success
    if (hasGameIdCached && gameId) {
      const redirect = amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'
      navigation.navigate('room', { screen: redirect })
    }
  }, [hasGameIdCached, gameId])

  React.useEffect(() => {
    // Tried to load cached game but without success
    if (hasGameIdCached && !profileGameId) {
      navigation.navigate('home')
    }
  }, [hasGameIdCached, profileGameId])

  React.useEffect(() => {
    // Triggered when the player clicks "I'm Ready" at lobby-writting
    // Need this to prevent RN redirect to "gate" when isPlaying changes
    if (isPlaying) {
      navigation.navigate('playing')
    }
  }, [isPlaying])

  // TODO later... learn routing redirect properly.
  if (!game) {
    return <Gate navigation={navigation} />
  }

  const initialRouter = amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'

  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false, headerTitleAlign: 'center' }}
      initialRouteName={initialRouter}
    >
      {isPlaying ? (
        <>
          <Stack.Screen name="playing" headerTitle="Playing" component={Playing} />
        </>
      ) : (
        <>
          <Stack.Screen name="lobby-joining" headerTitle="New game" component={LobbyJoining} />
          <Stack.Screen name="teams" headerTitle="Teams" component={Teams} />
          <Stack.Screen name="write-papers" headerTitle="Write papers" component={WritePapers} />
          <Stack.Screen name="lobby-writing" headerTitle="Writting" component={LobbyWriting} />
        </>
      )}
      <Stack.Screen name="gate" component={Gate} />
    </Stack.Navigator>
  )
}

GameRoomEntry.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
  route: PropTypes.object, // ReactNavigation
}
