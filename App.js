import * as React from 'react'
import { AsyncStorage, Platform, StatusBar, StyleSheet, View, Text } from 'react-native'
import * as Updates from 'expo-updates'

import { SplashScreen } from 'expo'
// import * as Font from 'expo-font';
// import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

// import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking'

import { PapersContextProvider, loadProfile } from './store/PapersContext.js'
import Home from './screens/home'
import GameRoom from './screens/game-room'
import Settings from './screens/settings'
import AccessGame from './screens/access-game'
import ErrorCrashed from './screens/misc/ErrorCrashed.js'

if (typeof ErrorUtils !== 'undefined') {
  console.log(':: has ErrorUtils')
  // TODO this is shitty and I don't understand... still figuring out how to do error handle/recover using Expo.
  // https://docs.expo.io/versions/latest/sdk/error-recovery/
  const defaultHandler =
    (ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler()) || ErrorUtils._globalHandler

  const customErrorHandler = async (err, isFatal) => {
    console.log('handling error...')
    const error = await AsyncStorage.getItem('lastError')
    console.log('hasLasterror!', !!error)
    if (!error) {
      await AsyncStorage.setItem('lastError', JSON.stringify(err, Object.getOwnPropertyNames(err)))
      await Updates.reloadAsync()
    } else {
      // return defaultHandler(err, isFatal)
    }
  }

  ErrorUtils.setGlobalHandler(customErrorHandler)
}

// import * as ErrorRecovery from 'expo-error-recovery';

const Stack = createStackNavigator()

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})

export default function App(props) {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  const [errorRecent, setErrorRecent] = React.useState(false)
  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const containerRef = React.useRef()
  const { getInitialState } = useLinking(containerRef)

  console.log(':: App errorRecovery::', props.errorRecovery)
  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        console.log('getting last error...')
        const lastError = await AsyncStorage.getItem('lastError')

        if (lastError) {
          setErrorRecent(lastError)
        }
        setInitialNavigationState(await getInitialState())

        setInitialProfile(await loadProfile())
        // // Load fonts REVIEW @mmbotelho
        // await Font.loadAsync({
        //   ...Ionicons.font,
        //   'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        // });
      } catch (e) {
        // TODO - report this to an external Error log service
        console.error('App.js loadResourcesAndDataAsync error!', e)
      } finally {
        setLoadingComplete(true)
        SplashScreen.hide()
      }
    }

    loadResourcesAndDataAsync()
  }, [])

  if (errorRecent) {
    return <ErrorCrashed errorStr={errorRecent} />
  }

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null
  } else {
    return (
      <PapersContextProvider initialProfile={initialProfile}>
        {/* // TODO Show loading while fetching game. */}
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
            <Stack.Navigator
              // initialRouteName="home"
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
