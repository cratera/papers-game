import * as React from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
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

const Stack = createStackNavigator()

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})

export default function App(props) {
  const [initialProfile, setInitialProfile] = React.useState({})
  const [isLoadingComplete, setLoadingComplete] = React.useState(false)
  const [initialNavigationState, setInitialNavigationState] = React.useState()
  const containerRef = React.useRef()
  const { getInitialState } = useLinking(containerRef)

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide()

        // Load our initial navigation state
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

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null
  } else {
    return (
      <PapersContextProvider initialProfile={initialProfile}>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
            <Stack.Navigator
              initialRouteName="settings"
              options={{ cardStyleInterpolator: forFade, gestureEnabled: false }}
              screenOptions={{ gestureEnabled: false }}
            >
              <Stack.Screen name="home" component={Home} />
              <Stack.Screen name="room" component={GameRoom} />
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
