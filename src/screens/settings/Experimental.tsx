import React from 'react'
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'

// TODO: expo-ads-admob is longer supported by Expo managed workflow, find alternative
// import {
//   AdMobBanner,
//   AdMobInterstitial,
//   // PublisherBanner,
//   AdMobRewarded,
//   setTestDeviceIDAsync,
// } from 'expo-ads-admob'

import * as Theme from '@src/theme'

import Button from '@src/components/button'
import Page from '@src/components/page'
import usePurchases from '@src/components/purchases/usePurchases'
import * as Sentry from '@src/services/sentry'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { useSubHeader } from './utils'

export default function SettingsExperimental({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings-experimental'>) {
  useSubHeader(navigation, 'Experimental')
  const { isPurchaserFree } = usePurchases()

  React.useEffect(() => {
    if (Platform.OS === 'web') return

    async function setAd() {
      // await setTestDeviceIDAsync('EMULATOR')
    }

    setAd()
  }, [])

  const styleBlock = {
    borderBottomWidth: 2,
    borderColor: Theme.colors.grayMedium,
    paddingVertical: 24,
    paddingHorizontal: 8,
    // marginVertical: 8,
  }
  return (
    <Page>
      <Page.Main>
        <ScrollView style={Styles.container}>
          <Text style={[Theme.typography.h3, Theme.utils.center]}>🚧 For Devs only! 🚧</Text>

          <Text>IsDev: {__DEV__.toString()}</Text>

          <View style={styleBlock}>
            <OtaChecker />
          </View>

          <View style={styleBlock}>
            <TestCrashing />
          </View>

          <View style={styleBlock}>
            <Button
              onPress={async () => {
                await AsyncStorage.removeItem('profile_settings')
                await AsyncStorage.removeItem('profile_stats')
              }}
            >
              AsyncStorage: Delete Settings and Stats
            </Button>
          </View>

          <View style={styleBlock}>
            <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mb_16]}>
              AdsMob
            </Text>

            {isPurchaserFree ? (
              <>
                {/* <AdMobBanner
                  bannerSize="largeBanner"
                  adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
                  // servePersonalizedAds // need permission to be true!
                  onDidFailToReceiveAdWithError={(errorMsg) => {
                    console.warn('banner failed!', errorMsg)
                  }}
                /> */}
                <Text>{'\n'}</Text>
                {Platform.OS !== 'web' && (
                  <>
                    <Button
                      onPress={async () => {
                        // await AdMobInterstitial.setAdUnitID(
                        //   'ca-app-pub-3940256099942544/1033173712'
                        // ) // Test ID, Replace with your-admob-unit-id
                        // await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: false })
                        // await AdMobInterstitial.showAdAsync()
                      }}
                    >
                      Trigger AdMobInterstitial
                    </Button>
                    <Text>{'\n'}</Text>

                    <Button
                      onPress={async () => {
                        // await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917') // Test ID, Replace with your-admob-unit-id
                        // await AdMobRewarded.requestAdAsync()
                        // await AdMobRewarded.showAdAsync()
                        // AdMobRewarded.addEventListener('rewardedVideoDidRewardUser', (reward) => {
                        //   console.log(':: rewarded DidReward', reward)
                        // })
                        // AdMobRewarded.addEventListener('rewardedVideoDidClose', (reward) => {
                        //   console.log(':: rewarded Closeed', reward)
                        // })
                      }}
                    >
                      Trigger AdMobReward
                    </Button>
                    <Text>{'\n\n'}</Text>
                  </>
                )}
              </>
            ) : (
              <Text>User is a member. No ads shown!</Text>
            )}
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

// ==========================

type OtaStatus = 'checking' | 'available' | 'not-available' | 'error'

function OtaChecker() {
  const [status, setStatus] = React.useState<OtaStatus>('checking')
  const [errorMsg, setErrorMsg] = React.useState('')
  // const [manifest, setManifest] = React.useState('')

  async function handleCheckClick() {
    try {
      setErrorMsg('')
      setStatus('checking')
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        setStatus('available')
        // setManifest(JSON.stringify(update.manifest))
      } else {
        setStatus('not-available')
      }
    } catch (e) {
      const error = e as Error
      setStatus('error')
      setErrorMsg(error.message)
    }
  }

  async function handleReloadClick() {
    await Updates.reloadAsync()
  }

  return (
    <View>
      <Button variant="light" isLoading={status === 'checking'} onPress={handleCheckClick}>
        Check for new updates
      </Button>
      {status === 'available' && (
        <Button variant="light" onPress={handleReloadClick}>
          New update available! Reload app.
        </Button>
      )}
      <View style={Theme.spacing.mt_8}>
        {status === 'not-available' && (
          <Text style={[Theme.typography.secondary, Theme.utils.center]}>
            App is already updated!
          </Text>
        )}
        {errorMsg && <Text style={[Theme.typography.error, Theme.utils.center]}>{errorMsg}</Text>}
        {/* {manifest && <Text style={[Theme.typography.secondary, Theme.utils.center]}>{manifest}</Text>} */}
      </View>
    </View>
  )
}

type TestCrashingStatus = 'error' | 'exc' | 'msg' | ''

function TestCrashing() {
  const [status, setStatus] = React.useState<TestCrashingStatus>('')

  async function forceCrash() {
    setStatus('error')
  }

  async function sendExc() {
    try {
      throw new Error('Test error')
    } catch (e) {
      Sentry.captureException(e)
      setStatus('exc')
    }
  }

  async function sendMsg() {
    Sentry.captureMessage('Easter egg! Heres a msg')
    setStatus('msg')
  }

  return (
    <View>
      {status === 'error' && <View>Cabbom!!</View>}
      <Button variant="light" onPress={forceCrash}>
        Force App crash
      </Button>
      <Button variant="light" onPress={sendExc}>
        {status === 'exc' ? 'Sent' : 'Send Sentry Exception'}
      </Button>
      <Button variant="light" onPress={sendMsg}>
        {status === 'msg' ? 'Sent' : 'Send Sentry Message'}
      </Button>
    </View>
  )
}

const Styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    marginHorizontal: -16,
  },
})
