import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import * as MailComposer from 'expo-mail-composer'
import { createStackNavigator } from '@react-navigation/stack'
import PropTypes from 'prop-types'

import * as Updates from 'expo-updates'
import {
  AdMobBanner,
  AdMobInterstitial,
  // PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob'
import * as StoreReview from 'expo-store-review'
import Sentry from '@constants/Sentry'

import * as Analytics from '@constants/analytics.js'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import { mailToFeedback, mailToBug } from '@constants/utils'
import { headerTheme } from '@navigation/headerStuff.js'
import Page from '@components/page'
import ListTeams from '@components/list-teams'
import Button from '@components/button'

import Item from './Item.js'

import SettingsProfile from './SettingsProfile.js'
import SettingsGame from './SettingsGame.js'
import Account from './Account.js'
import AccountDeletion from './AccountDeletion.js'
import Privacy from './Privacy.js'
import SoundAnimations from './SoundAnimations.js'

import { propTypesCommon, setSubHeader } from './utils'

const Stack = createStackNavigator()

export default function Settings(props) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state

  React.useEffect(() => {
    props.navigation.setOptions({
      ...headerTheme(),
      headerTitle: 'Settings',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn
            side="left"
            icon="back"
            onPress={() =>
              props.navigation.canGoBack()
                ? props.navigation.goBack()
                : props.navigation.navigate(game ? 'room' : 'home')
            }
          >
            Back
          </Page.HeaderBtn>
        )
      },
    })
    Analytics.setCurrentScreen('settings')
  }, [])

  return (
    <Stack.Navigator headerMode="none">
      {game ? (
        <>
          <Stack.Screen name="settings-game" component={SettingsGame} />
          <Stack.Screen name="settings-players" component={SettingsPlayers} />
        </>
      ) : (
        <Stack.Screen name="settings-profile" component={SettingsProfile} />
      )}
      <Stack.Screen name="settings-account" component={Account} />
      <Stack.Screen name="settings-accountDeletion" component={AccountDeletion} />
      <Stack.Screen name="settings-privacy" component={Privacy} />

      <Stack.Screen name="settings-feedback" component={SettingsFeedback} />
      <Stack.Screen name="settings-sound" component={SoundAnimations} />
      <Stack.Screen name="settings-experimental" component={SettingsExperimental} />
      <Stack.Screen name="settings-credits" component={SettingsCredits} />
    </Stack.Navigator>
  )
}

Settings.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ======

function SettingsFeedback({ navigation }) {
  function updateHeaderBackBtn({ title, btnText, onPress }) {
    navigation.dangerouslyGetParent().setOptions({
      headerTitle: title,
      headerLeft: function HB() {
        return (
          <Page.HeaderBtn side="left" icon="back" onPress={onPress}>
            {btnText}
          </Page.HeaderBtn>
        )
      },
    })
  }

  React.useEffect(() => {
    updateHeaderBackBtn({
      title: 'Feedback',
      btnText: 'Back',
      onPress: () => {
        navigation.goBack()
        updateHeaderBackBtn({
          title: 'Settings',
          btnText: 'Back',
          onPress: () => navigation.dangerouslyGetParent().goBack(),
        })
      },
    })
  }, [])

  return (
    <Page>
      <Page.Main style={{ paddingTop: 16 }}>
        <ScrollView>
          {[
            {
              id: 'rate',
              title: 'Rate Papers',
              icon: '',
              onPress: () => StoreReview.requestReview(), // TODO!! before release
            },
            {
              id: 'fb',
              title: 'Send Feedback',
              icon: '',
              onPress: async () => {
                await MailComposer.composeAsync(mailToFeedback())
              },
            },
            {
              id: 'fbug',
              title: 'Report a bug',
              icon: '',
              onPress: async () => {
                await MailComposer.composeAsync(mailToBug())
              },
            },
          ].map(item => (
            <Item key={item.id} {...item} />
          ))}
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsFeedback.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ======

function SettingsExperimental({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Experimental')
    async function setAd() {
      await setTestDeviceIDAsync('EMULATOR')
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
        <ScrollView style={{ paddingTop: 32, marginHorizontal: -16 }}>
          <Text style={[Theme.typography.h3, Theme.u.center]}>🚧 For Devs only. Stay away! 🚧</Text>

          <View style={styleBlock}>
            <OtaChecker />
          </View>

          <View style={styleBlock}>
            <TestCrashing />
          </View>

          <View style={styleBlock}>
            <Text style={[Theme.typography.h3, Theme.u.center, { marginBottom: 16 }]}>
              AdMob tests
            </Text>

            <AdMobBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              // servePersonalizedAds // need permission to be true!
              onDidFailToReceiveAdWithError={errorMsg => {
                console.warn('banner failed!', errorMsg)
              }}
            />
            <Text>{'\n'}</Text>
            <Button
              onPress={async () => {
                await AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/1033173712') // Test ID, Replace with your-admob-unit-id
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
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsExperimental.propTypes = propTypesCommon

// ======

function SettingsCredits({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Acknowledgements')
  }, [])

  return (
    <Page>
      <Page.Main style={{ paddingTop: 16 }}>
        <ScrollView>
          <Text>TODO: Acknowledgments</Text>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsCredits.propTypes = propTypesCommon

// ======

function SettingsPlayers({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Players')
  }, [])

  return (
    <Page>
      <Page.Main style={{ paddingTop: 16 }}>
        <ScrollView>
          <ListTeams enableKickout />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsPlayers.propTypes = propTypesCommon

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
