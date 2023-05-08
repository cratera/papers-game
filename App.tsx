import { init as sentryInit } from '@src/services/sentry'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

sentryInit()

export default function App() {
  const [fontsLoaded] = useFonts({
    YoungSerif: require('./assets/fonts/YoungSerif-Regular.ttf'),
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={Styles.container} onLayout={onLayoutRootView}>
      <Text style={Styles.text}>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const backgroundColor = '#fff'
const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'YoungSerif',
  },
})
