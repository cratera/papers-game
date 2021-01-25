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

import Purchases from 'react-native-purchases'

import Sentry from './constants/Sentry'
import { cardForFade } from './constants/animations'
import { REVENUECAT_PUBLIC_SDK_KEY } from './constants/constants'
import { headerTheme } from './navigation/headerStuff.js'
import useLinking from './navigation/useLinking'
import { PapersContextProvider, loadProfile } from './store/PapersContext.js'
import Home from './screens/home'
import GameRoom from './screens/game-room'
import Settings from './screens/settings'
import AccessGame from './screens/access-game'
import Tutorial from './screens/tutorial'

const Stack = createStackNavigator()

export default function AppFn() {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const navigationRef = React.useRef()
  const { getInitialState } = useLinking(navigationRef)

  React.useEffect(() => {
    StatusBar.setHidden(true, 'none')

    async function loadResourcesAndDataAsync() {
      try {
        // https://github.com/expo/expo/issues/10816
        await SplashScreen.preventAutoHideAsync()
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn_0' } })
      }

      try {
        setInitialNavigationState(await getInitialState())

        const profile = await loadProfile()
        setInitialProfile(profile)

        await Font.loadAsync({
          'Karla-Regular': require('./assets/fonts/Karla-Regular.ttf'),
          'Karla-Bold': require('./assets/fonts/Karla-Bold.ttf'),
          'YoungSerif-Regular': require('./assets/fonts/YoungSerif-Regular.ttf'),
        })
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn_1' } })
      } finally {
        setLoadingComplete(true)
        await SplashScreen.hideAsync()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      Purchases.setDebugLogsEnabled(__DEV__)
      Purchases.setup(REVENUECAT_PUBLIC_SDK_KEY)
    }
  }, [])

  if (!isLoadingComplete) {
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
