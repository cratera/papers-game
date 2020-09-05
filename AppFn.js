import * as React from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { SplashScreen } from 'expo'

// import * as Analytics from '@constants/analytics.js'

import * as Font from 'expo-font'
// import { Ionicons } from '@expo/vector-icons'; // Q: How to remove this from bundle?

import { NavigationContainer } from '@react-navigation/native'
import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack'

import Sentry from '@constants/Sentry'
// import { SCREEN_FADE } from '@constants/constants'

import useLinking from './navigation/useLinking'
import { headerForFade, cardForFade } from './constants/animations'
import { PapersContextProvider, loadProfile } from './store/PapersContext.js'
import Home from './screens/home'
import GameRoom from './screens/game-room'
import Settings from './screens/settings'
import AccessGame from './screens/access-game'

const Stack = createStackNavigator()

export default function AppFn({ skipLoadingScreen }) /* eslint-disable-line */ {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  // const [errorRecent, setErrorRecent] = React.useState(false)
  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const navigationRef = React.useRef()
  // const routeNameRef = React.useRef()
  const { getInitialState } = useLinking(navigationRef)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    StatusBar.setHidden(true, 'none')

    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        setInitialNavigationState(await getInitialState())

        setInitialProfile(await loadProfile())

        // Load fonts REVIEW @mmbotelho
        await Font.loadAsync({
          // ...Ionicons.font,
          'karla-regular': require('./assets/fonts/karla/Karla-Regular.ttf'),
          // 'karla-bold': require('./assets/fonts/karla/Karla-Regular.ttf'),
          'youngSerif-regular': require('./assets/fonts/youngSerif/YoungSerif-Regular.ttf'),
        })
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
        <NavigationContainer ref={navigationRef} initialState={initialNavigationState}>
          <Stack.Navigator
            initialRouteName={initialProfile.gameId ? 'room' : 'home'}
            screenOptions={{
              gestureEnabled: false,
              headerStatusBarHeight: 20,
              headerTransparent: true, // Do globally to avoid jumps in screens
              headerTitleAlign: 'center',
              // headerStyleInterpolator: HeaderStyleInterpolators.forFade,
              cardStyleInterpolator: cardForFade,
              // animationEnabled: false,
            }}
          >
            <Stack.Screen name="home" component={Home} options={{ title: '' }} />
            <Stack.Screen
              name="access-game"
              component={AccessGame}
              options={{
                title: '',
                headerLeft: null,
              }}
            />
            <Stack.Screen
              name="room"
              component={GameRoom}
              options={{
                headerShown: false,
              }}
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
  },
})
