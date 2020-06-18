import React from 'react'
import {
  Image,
  TouchableHighlight,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import * as MailComposer from 'expo-mail-composer'
import { createStackNavigator } from '@react-navigation/stack'
import PropTypes from 'prop-types'
import * as Updates from 'expo-updates'
import * as Linking from 'expo-linking'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import { mailToSupport } from '@constants/utils'
import { headerTheme } from '@navigation/headerStuff.js'
// import { logEvent } from '@store/Firebase.js'
import Page from '@components/page'
import ListTeams from '@components/list-teams'
import GameScore from '@components/game-score'
import Button from '@components/button'
import { PickAvatar } from '@components/profile'
import { useLeaveGame } from '@components/settings'
import { IconArrow, IconCamera } from '@components/icons'
import AudioPreview from './AudioPreview.js'
import * as StoreReview from 'expo-store-review'
import Sentry from '@constants/Sentry'

const Stack = createStackNavigator()

const propTypesCommon = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// TODO later Hummm... it's about time to split these into diff files, no?

export default function Settings(props) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state

  React.useEffect(() => {
    props.navigation.setOptions({
      ...headerTheme(),
      headerTitle: 'Settings',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" icon="back" onPress={() => props.navigation.goBack()}>
            Back
          </Page.HeaderBtn>
        )
      },
    })
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
      <Stack.Screen name="settings-feedback" component={SettingsFeedback} />
      <Stack.Screen name="settings-playground" component={SettingsPlayground} />
      <Stack.Screen name="settings-credits" component={SettingsCredits} />
    </Stack.Navigator>
  )
}

Settings.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ======

function SettingsProfile({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile, about } = Papers.state

  function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave the game?')) {
        Papers.leaveGame()
      }
    } else {
      Alert.alert(
        'Delete account',
        "This will delete your account locally and from Papers' servers",
        [
          {
            text: 'Delete account',
            onPress: async () => {
              await Papers.resetProfile()
              navigation.dangerouslyGetParent().reset({
                index: 0,
                routes: [{ name: 'home' }],
              })
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Delete account cancelled'),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView style={Theme.u.scrollSideOffset}>
          <AvatarSquare
            style={Styles.avatar}
            avatar={profile.avatar}
            onChange={avatar => Papers.updateProfile({ avatar })}
          />
          <Text nativeID="inputNameLabel" style={[Styles.alignLeft, Theme.typography.small]}>
            Name
          </Text>
          <TextInput
            style={Styles.input}
            inputAccessoryViewID="name"
            nativeID="inputNameLabel"
            defaultValue={profile.name}
            returnKeyType="done"
            onChangeText={text => setName(text)}
            onBlur={() => name && Papers.updateProfile({ name })}
          />
          <View
            style={{
              paddingTop: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: Theme.colors.grayLight,
            }}
          >
            <Text style={[Styles.alignLeft, Theme.typography.small, {}]}>More options</Text>
          </View>
          {[
            {
              id: 'fb',
              title: 'Feedback',
              icon: 'next',
              onPress: () => navigation.navigate('settings-feedback'),
            },
            {
              id: 'pg',
              title: 'Playground',
              icon: 'next',
              onPress: () => navigation.navigate('settings-playground'),
            },
            {
              id: 'don',
              title: 'Buy us a coffee', // TODO!! Before release
              onPress: () => {
                Linking.openURL('https://www.buymeacoffee.com/sandrinap')
              },
            },
            {
              id: 'del',
              title: 'Delete account',
              variant: 'danger',
              onPress: handleDeleteAccount,
            },
          ].map(item => (
            <Item key={item.id} {...item} />
          ))}
          <View style={[{ marginTop: 32, marginBottom: 32 }]}>
            <TouchableOpacity onPress={() => navigation.navigate('settings-credits')}>
              <Text style={[Theme.typography.small, Theme.u.center]}>
                You are using version {about.version}.{about.ota}
              </Text>
              <Text
                style={[
                  Theme.typography.small,
                  Theme.u.center,
                  { color: Theme.colors.grayDark, marginTop: 4 },
                ]}
              >
                Acknowledgments
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsProfile.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

// ======

function SettingsGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame()
  const { game } = Papers.state

  if (!game) {
    return null
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView>
          <Text
            style={[Theme.typography.h2, Theme.u.center, { marginTop: 24, marginBottom: 8 }]}
            accessibilityRole="header"
          >
            {game.name}
          </Text>
          <GameScore
            style={{
              paddingBottom: 16,
              marginBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: Theme.colors.grayLight,
            }}
          />
          {/* BUG FlatList: https://github.com/GeekyAnts/NativeBase/issues/2947 */}
          {[
            {
              id: 'pl',
              title: 'Players',
              icon: 'next',
              onPress: () => {
                navigation.navigate('settings-players')
              },
            },
            {
              id: 'lg',
              title: 'Leave Game',
              variant: 'danger',
              onPress: askToLeaveGame,
            },
          ].map(item => (
            <Item key={item.id} {...item} />
          ))}
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsGame.propTypes = {
  onMount: PropTypes.object, // react-navigation
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
                await MailComposer.composeAsync(mailToSupport())
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

function SettingsPlayground({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Playground')
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
      <Page.Main style={{ paddingTop: 16 }}>
        <ScrollView>
          <Text style={[Theme.typography.h3, Theme.u.center]}>🚧 For Devs only. Stay away! 🚧</Text>

          <View style={styleBlock}>
            <TestCrashing />
          </View>
          <View style={styleBlock}>
            <OtaChecker />
          </View>
          <View style={styleBlock}>
            <AudioPreview />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
SettingsPlayground.propTypes = propTypesCommon

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

const Styles = StyleSheet.create({
  avatar: {
    marginTop: 24,
    marginBottom: 32,
  },
  input: {
    borderColor: 'transparent',
    borderWidth: 0,
    padding: 12,
    marginTop: 4,
    fontSize: 16,
    color: Theme.colors.grayDark,
    backgroundColor: Theme.colors.bg,
  },
  list: {
    marginTop: 10,
  },
  alignLeft: {
    paddingLeft: 8,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 20, // looks better visually
    paddingHorizontal: 8,
  },
})

// ==========================

const AvatarSquare = ({ avatar, style, onChange }) => {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false)

  return (
    <View style={[StylesAv.avatar, style]}>
      <TouchableHighlight
        underlayColor={Theme.colors.bg}
        style={StylesAv.square}
        onPress={() => setIsPickerVisible(true)}
      >
        {avatar ? (
          <Image
            style={[StylesAv.place, StylesAv.img]}
            source={{ uri: avatar }}
            accessibilityLabel="Your uploaded avatar"
          />
        ) : (
          <View style={[StylesAv.place]} />
        )}
      </TouchableHighlight>
      <View style={[StylesAv.icon]}>
        <IconCamera size={13} color={Theme.colors.bg} />
      </View>
      <PickAvatar
        visible={isPickerVisible}
        onChange={() => null}
        onSubmit={onChange}
        onClose={() => setIsPickerVisible(false)}
      />
    </View>
  )
}

AvatarSquare.propTypes = {
  avatar: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  onChange: PropTypes.func.isRequired, // (value: String)
}

const StylesAv = StyleSheet.create({
  avatar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  place: {
    width: 112,
    height: 112,
    borderRadius: 3,
    backgroundColor: Theme.colors.primaryLight,
  },
  icon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Theme.colors.primary,
    width: 20,
    height: 20,
    borderRadius: 4,
    paddingTop: 3,
    paddingLeft: 3,
    overflow: 'hidden',
  },
  img: {
    resizeMode: 'cover',
  },
})

// ==========================

function Item({ title, icon, variant, isLast, onPress }) {
  return (
    <TouchableHighlight underlayColor={Theme.colors.grayLight} onPress={onPress}>
      <View
        style={[
          Styles.item,
          {
            borderBottomColor: Theme.colors.grayLight,
            borderBottomWidth: isLast ? 0 : 1,
          },
        ]}
      >
        <Text
          style={[
            Theme.typography.body,
            {
              ...(variant === 'danger' ? { color: Theme.colors.danger } : {}),
            },
          ]}
        >
          {title}
        </Text>
        {icon ? <IconArrow size={20} /> : null}
      </View>
    </TouchableHighlight>
  )
}

Item.propTypes = {
  title: PropTypes.string.isRequired,
  isLast: PropTypes.bool,
  variant: PropTypes.oneOf(['danger']),
  icon: PropTypes.node,
  onPress: PropTypes.func,
}

// ==========================

function OtaChecker() {
  const [status, setstatus] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState(null)
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
    console.log('Result', status)
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
        {manifest && <Text style={[Theme.typography.secondary, Theme.u.center]}>{manifest}</Text>}
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
      const foo = status.foo.bar
      console.log(foo)
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

/// =======================
/// =======================

function setSubHeader(navigation, title) {
  // If you find a better way of doing this. Please let me know.
  // I spent too many hours googling it and didn't find a pretty way.
  // In these corner cases, react navigation docs weren't very helpful...
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

  updateHeaderBackBtn({
    title: title,
    btnText: 'Back',
    onPress: () => {
      navigation.goBack()
      updateHeaderBackBtn({
        title: 'Settings',
        btnText: 'Back',
        onPress: () =>
          // navigation.dangerouslyGetState()?.index === 0
          //   ? navigation.dangerouslyGetParent().navigate('home')
          navigation.dangerouslyGetParent().goBack(),
      })
    },
  })
}
