import * as React from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'

// import * as Analytics from '@constants/analytics.js'

import * as Font from 'expo-font'

import { NavigationContainer } from '@react-navigation/native'
import {
  createStackNavigator,
  CardStyleInterpolators,
  HeaderStyleInterpolators,
} from '@react-navigation/stack'

import Sentry from '@constants/Sentry'
import { headerTheme } from './navigation/headerStuff.js'
import useLinking from './navigation/useLinking'
import { cardForFade } from './constants/animations'
import { PapersContextProvider, loadProfile } from './store/PapersContext.js'
import Home from './screens/home'
import GameRoom from './screens/game-room'
import Settings from './screens/settings'
import AccessGame from './screens/access-game'
import Tutorial from './screens/tutorial'

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
        await SplashScreen.preventAutoHideAsync()

        setInitialNavigationState(await getInitialState())

        setInitialProfile(await loadProfile())

        // Load fonts REVIEW @mmbotelho
        await Font.loadAsync({
          // ...Ionicons.font,
          'Karla-Regular': require('./assets/fonts/Karla-Regular.ttf'),
          'Karla-Bold': require('./assets/fonts/Karla-Bold.ttf'),
          'YoungSerif-Regular': require('./assets/fonts/YoungSerif-Regular.ttf'),
        })
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn' } })
      } finally {
        setLoadingComplete(true)
        await SplashScreen.hideAsync()
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
              ...headerTheme(),
              cardStyleInterpolator: cardForFade,
            }}
          >
            <Stack.Screen name="home" component={Home} options={{ title: '' }} />
            <Stack.Screen
              name="access-game"
              component={AccessGame}
              options={{
                title: '',
              }}
            />
            <Stack.Screen
              name="room"
              component={GameRoom}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings"
              component={Settings}
              options={{
                title: '',
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                headerStyleInterpolator: HeaderStyleInterpolators.forFade,
              }}
            />
            <Stack.Screen
              name="tutorial"
              component={Tutorial}
              options={{
                title: '',
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                headerStyleInterpolator: HeaderStyleInterpolators.forFade,
              }}
            />
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
