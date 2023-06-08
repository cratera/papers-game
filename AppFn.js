import * as SplashScreen from 'expo-splash-screen'
import * as React from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'

// import { analytics as Analytics } from '@src/services/firebase'

import * as Font from 'expo-font'

import { NavigationContainer } from '@react-navigation/native'
import {
  CardStyleInterpolators,
  createStackNavigator,
  HeaderStyleInterpolators,
} from '@react-navigation/stack'

// import Purchases from 'react-native-purchases'

import { headerTheme } from '@src/navigation/headerStuff.js'
import linking from '@src/navigation/linking'
import AccessGame from '@src/screens/access-game'
import GameRoom from '@src/screens/game-room'
import Home from '@src/screens/home'
import Settings from '@src/screens/settings'
import Tutorial from '@src/screens/tutorial'
import * as Sentry from '@src/services/sentry'
import { loadProfile, PapersContextProvider } from '@src/store/PapersContext'
import { animations } from '@src/theme'

const Stack = createStackNavigator()

export default function AppFn() {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)

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
      // Purchases.setDebugLogsEnabled(__DEV__)
      // Purchases.setup(REVENUECAT_PUBLIC_SDK_KEY)
    }
  }, [])

  if (!isLoadingComplete) {
    return null
  }

  return (
    <PapersContextProvider initialProfile={initialProfile}>
      <View style={Styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
        <NavigationContainer linking={linking}>
          <Stack.Navigator
            initialRouteName={initialProfile.gameId ? 'room' : 'home'}
            screenOptions={{
              gestureEnabled: false,
              ...headerTheme(),
              cardStyleInterpolator: animations.fadeCard,
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
