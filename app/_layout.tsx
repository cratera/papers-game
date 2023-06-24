import * as Font from 'expo-font'
import { ErrorBoundaryProps, SplashScreen, Stack } from 'expo-router'
import { useState } from 'react'
import { LogBox, StatusBar, StyleSheet, View } from 'react-native'
import { useEffectOnce } from 'usehooks-ts'

import ErrorPage from '@src/screens/misc/ErrorPage'
import * as Sentry from '@src/services/sentry'
import { loadProfile, PapersContextProvider } from '@src/store/PapersContext'
import { Profile } from '@src/store/PapersContext.types'

Sentry.init()

if (LogBox) {
  LogBox.ignoreLogs([
    'Setting a timer',
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
  ])
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorPage {...props} />
}

export default function Layout() {
  const [initialProfile, setInitialProfile] = useState<Maybe<Profile>>(undefined)
  const [isLoadingComplete, setLoadingComplete] = useState(false)

  useEffectOnce(() => {
    StatusBar.setHidden(true, 'none')

    async function loadResourcesAndDataAsync() {
      try {
        // https://github.com/expo/expo/issues/10816
        SplashScreen.preventAutoHideAsync()
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn_0' } })
      }

      try {
        const profile = await loadProfile()
        setInitialProfile(profile)

        // Load fonts
        await Font.loadAsync({
          'Karla-Regular': require('../assets/fonts/Karla-Regular.ttf'),
          'Karla-Bold': require('../assets/fonts/Karla-Bold.ttf'),
          'YoungSerif-Regular': require('../assets/fonts/YoungSerif-Regular.ttf'),
        })
      } catch (e) {
        Sentry.captureException(e, { tags: { pp_page: 'AppFn_1' } })
      } finally {
        setLoadingComplete(true)
        SplashScreen.hideAsync()
      }
    }

    loadResourcesAndDataAsync()
  })

  if (!isLoadingComplete) {
    return null
  }

  if (initialProfile) {
    return (
      <PapersContextProvider initialProfile={initialProfile}>
        <View style={Styles.container}>
          <Stack />
        </View>
      </PapersContextProvider>
    )
  }

  return null
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
