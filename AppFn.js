import * as React from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { SplashScreen } from 'expo'

// import * as Font from 'expo-font';
// import { Ionicons } from '@expo/vector-icons'; // Q: How to remove this from bundle?

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Sentry from '@constants/Sentry'
// import { SCREEN_FADE } from '@constants/constants'

import useLinking from './navigation/useLinking'

import { PapersContextProvider, loadProfile } from './store/PapersContext.js'
import Home from './screens/home'
import GameRoom from './screens/game-room'
import Settings from './screens/settings'
import AccessGame from './screens/access-game'

const Stack = createStackNavigator()

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})

export default function AppFn({ skipLoadingScreen }) /* eslint-disable-line */ {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  // const [errorRecent, setErrorRecent] = React.useState(false)
  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const containerRef = React.useRef()
  const { getInitialState } = useLinking(containerRef)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        setInitialNavigationState(await getInitialState())

        setInitialProfile(await loadProfile())

        // // Load fonts REVIEW @mmbotelho
        // await Font.loadAsync({
        //   ...Ionicons.font,
        //   'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        // });
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn' } })
      } finally {
        setLoadingComplete(true)
        SplashScreen.hide()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  if (!isLoadingComplete && !skipLoadingScreen) {
    return null
  }

  return (
    <PapersContextProvider initialProfile={initialProfile}>
      <View style={Styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
        <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
          <Stack.Navigator
            initialRouteName={initialProfile.gameId ? 'room' : 'home'}
            screenOptions={{ gestureEnabled: false, headerTitleAlign: 'center' }}
          >
            <Stack.Screen name="home" component={Home} />
            <Stack.Screen name="access-game" component={AccessGame} />
            <Stack.Screen
              name="room"
              component={GameRoom}
              options={{ cardStyleInterpolator: forFade, headerShown: false }}
            />
            <Stack.Screen name="settings" component={Settings} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </PapersContextProvider>
  )
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
