import React from 'react'
import { Platform, ScrollView, View, Text } from 'react-native'

import * as Updates from 'expo-updates'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  AdMobBanner,
  AdMobInterstitial,
  // PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob'

import * as Theme from '@theme'

import Sentry from '@constants/Sentry'
import Page from '@components/page'
import Button from '@components/button'
import usePurchases from '@components/purchases/usePurchases.js'

import { propTypesCommon, useSubHeader } from './utils'

export default function SettingsExperimental({ navigation }) {
  useSubHeader(navigation, 'Experimental')
  const { isPurchaserFree } = usePurchases()

  React.useEffect(() => {
    if (Platform.OS === 'web') return

    async function setAd() {
      await setTestDeviceIDAsync('EMULATOR')
    }

    setAd()
  }, [])

  React.useEffect(() => {})

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
        <ScrollView style={{ paddingTop: 32, marginHorizontal: -16 }}>
          <Text style={[Theme.typography.h3, Theme.u.center]}>🚧 For Devs only! 🚧</Text>

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
            <Text style={[Theme.typography.h3, Theme.u.center, { marginBottom: 16 }]}>AdsMob</Text>

            {isPurchaserFree ? (
              <>
                <AdMobBanner
                  bannerSize="largeBanner"
                  adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
                  // servePersonalizedAds // need permission to be true!
                  onDidFailToReceiveAdWithError={errorMsg => {
                    console.warn('banner failed!', errorMsg)
                  }}
                />
                <Text>{'\n'}</Text>
                {Platform.OS !== 'web' && (
                  <>
                    <Button
                      onPress={async () => {
                        await AdMobInterstitial.setAdUnitID(
                          'ca-app-pub-3940256099942544/1033173712'
                        ) // Test ID, Replace with your-admob-unit-id
                        await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: false })
                        await AdMobInterstitial.showAdAsync()
                      }}
                    >
                      Trigger AdMobInterstitial
                    </Button>
                    <Text>{'\n'}</Text>

                    <Button
                      onPress={async () => {
                        await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917') // Test ID, Replace with your-admob-unit-id
                        await AdMobRewarded.requestAdAsync()
                        await AdMobRewarded.showAdAsync()
                        AdMobRewarded.addEventListener('rewardedVideoDidRewardUser', reward => {
                          console.log(':: rewarded DidReward', reward)
                        })
                        AdMobRewarded.addEventListener('rewardedVideoDidClose', reward => {
                          console.log(':: rewarded Closeed', reward)
                        })
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
SettingsExperimental.propTypes = propTypesCommon

// ==========================

function OtaChecker() {
  const [status, setstatus] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState(null)
  // eslint-disable-next-line no-unused-vars
  const [manifest, setManifest] = React.useState(null)

  async function handleCheckClick() {
    try {
      setErrorMsg(null)
      setstatus('checking')
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        setstatus('available')
        setManifest(JSON.stringify(update.manifest))
      } else {
        setstatus('not-available')
      }
    } catch (e) {
      setstatus('error')
      setErrorMsg(e.message)
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
        <Button variant="light" isLoading={status === 'checking'} onPress={handleReloadClick}>
          New update available! Reload app.
        </Button>
      )}
      <View style={{ marginTop: 8 }}>
        {status === 'not-available' && (
          <Text style={[Theme.typography.sencondary, Theme.u.center]}>App is already updated!</Text>
        )}
        {errorMsg && <Text style={[Theme.typography.error, Theme.u.center]}>{errorMsg}</Text>}
        {/* {manifest && <Text style={[Theme.typography.secondary, Theme.u.center]}>{manifest}</Text>} */}
      </View>
    </View>
  )
}

function TestCrashing() {
  const [status, setstatus] = React.useState('')

  async function forceCrash() {
    setstatus('error')
  }

  async function sendExc() {
    try {
      // eslint-disable-next-line no-unused-vars
      const foo = status.foo.bar
    } catch (e) {
      Sentry.captureException(e)
      setstatus('exc')
    }
  }

  async function sendMsg() {
    Sentry.captureMessage('Easter egg! Heres a msg')
    setstatus('msg')
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
