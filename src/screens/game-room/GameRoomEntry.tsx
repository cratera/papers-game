import React from 'react'

// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack'
import PapersContext from '@src/store/PapersContext'

import { headerTheme } from '@src/navigation/headerStuff'
import { animations } from '@src/theme'

import { RouteProp } from '@react-navigation/native'
import { AppStackParamList } from '@src/navigation/navigation.types'
import Gate from './Gate'
import LobbyJoining from './LobbyJoining'
import LobbyWriting from './LobbyWriting'
import Playing from './playing/PlayingEntry'
import Teams from './Teams'
import WritePapers from './WritePapers'

const Stack = createStackNavigator<AppStackParamList>()

export default function GameRoomEntry({
  navigation,
  route,
}: StackScreenProps<AppStackParamList, 'room'>) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const hasGameIdCached = React.useRef(!!profile?.gameId).current
  const profileId = profile?.id || ''
  const profileGameId = profile?.gameId

  const { id: gameId } = game || {}

  const wordsAreStored = !!game?.words?.[profileId]
  const amIReady = !!game?.players[profileId]?.isReady
  const isPlaying = game?.hasStarted || amIReady

  React.useEffect(() => {
    if (!profileId) {
      // TODO later - info the profile is needed first.
      navigation.navigate('home')
    }
  }, [navigation, profileId])

  React.useEffect(() => {
    // Player left / was kicked, or game was deleted, etc...
    if (!profileGameId && !game) {
      navigation.navigate('home')
    }
  }, [profileGameId, game, navigation])

  React.useEffect(() => {
    // Loaded cached game with success
    if (hasGameIdCached && gameId) {
      const redirect = amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'
      navigation.navigate('room', { screen: redirect })
    }
  }, [hasGameIdCached, gameId, amIReady, wordsAreStored, navigation])

  React.useEffect(() => {
    // Tried to load cached game but without success
    if (hasGameIdCached && !profileGameId) {
      navigation.navigate('home')
    }
  }, [hasGameIdCached, navigation, profileGameId])

  React.useEffect(() => {
    // Triggered when the player clicks "I'm Ready" at lobby-writting
    // Need this to prevent RN redirect to "gate" when isPlaying changes
    if (isPlaying) {
      navigation.navigate('playing')
    }
  }, [isPlaying, navigation])

  // TODO: later... learn routing redirect properly.
  if (!game) {
    return (
      <Gate
        navigation={navigation as StackNavigationProp<AppStackParamList, 'gate'>}
        route={route as unknown as RouteProp<AppStackParamList, 'gate'>}
      />
    )
  }

  const initialRouter = amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'

  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        cardStyleInterpolator: animations.fadeCard,
        ...headerTheme(),
      }}
      initialRouteName={initialRouter}
    >
      {isPlaying ? (
        <>
          <Stack.Screen name="playing" component={Playing} options={{ headerTitle: 'Playing' }} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="lobby-joining"
            component={LobbyJoining}
            options={{ headerTitle: 'New game' }}
          />
          <Stack.Screen name="teams" component={Teams} />
          <Stack.Screen
            name="write-papers"
            component={WritePapers}
            options={{ headerTitle: 'Write Papers' }}
          />
          <Stack.Screen name="lobby-writing" component={LobbyWriting} />
        </>
      )}
      <Stack.Screen
        name="gate"
        component={Gate}
        options={{
          title: '',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
