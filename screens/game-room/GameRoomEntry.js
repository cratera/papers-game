import React from 'react'
import PropTypes from 'prop-types'
// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import { createStackNavigator } from '@react-navigation/stack'
// import { confirmLeaveGame } from '@constants/utils.js'
import PapersContext from '@store/PapersContext.js'
import { SCREEN_FADE } from '@constants/constants'
import Gate from './Gate'
import LobbyJoining from './LobbyJoining.js'
import Teams from './Teams.js'
import WritePapers from './WritePapers'
import LobbyWriting from './LobbyWriting.js'
import Playing from './playing/PlayingEntry'

const Stack = createStackNavigator()

export default function GameRoomEntry({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const hasGameIdCached = React.useRef(!!profile.gameId).current
  const profileId = profile.id
  const profileGameId = profile.gameId

  const { id: gameId } = game || {}

  const wordsAreStored = !!game?.words?.[profileId]
  const amIReady = !!game?.players[profileId]?.isReady

  React.useEffect(() => {
    // Player left / was kicked, or game was deleted, etc...
    if (!profileGameId && !game) {
      console.log(':: room -> home (left)')
      navigation.navigate('home')
    }
  }, [profileGameId, game])

  React.useEffect(() => {
    // Loaded cached game with success
    if (hasGameIdCached && gameId) {
      const redirect = amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'
      console.log(':: room -> room:' + redirect)
      navigation.navigate('room', { screen: redirect })
    }
  }, [hasGameIdCached, gameId])

  React.useEffect(() => {
    // Tried to load cached game but without success
    if (hasGameIdCached && !profileGameId) {
      console.log(':: room -> home (not found)')
      navigation.navigate('home')
    }
  }, [hasGameIdCached, profileGameId])

  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false, headerTitleAlign: 'center' }}
      initialRouteName={
        !gameId || !game
          ? 'gate'
          : amIReady
          ? 'playing'
          : wordsAreStored
          ? 'lobby-writing'
          : 'lobby-joining'
      }
    >
      <Stack.Screen
        name="gate"
        component={Gate}
        options={{ cardStyleInterpolator: SCREEN_FADE, headerShown: false }}
      />
      {game?.hasStarted || amIReady ? (
        <Stack.Screen name="playing" component={Playing} />
      ) : gameId ? (
        <>
          <Stack.Screen name="lobby-joining" headerTitle="New game" component={LobbyJoining} />
          <Stack.Screen name="teams" headerTitle="Teams" component={Teams} />
          <Stack.Screen name="write-papers" headerTitle="Write papers" component={WritePapers} />
          <Stack.Screen name="lobby-writing" headerTitle="Writting" component={LobbyWriting} />
        </>
      ) : null}
    </Stack.Navigator>
  )
}

GameRoomEntry.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
}
