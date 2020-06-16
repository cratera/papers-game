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
import { createStackNavigator } from '@react-navigation/stack'
import PropTypes from 'prop-types'
import * as Updates from 'expo-updates'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import { headerTheme } from '@navigation/headerStuff.js'
import { logEvent } from '@store/Firebase.js'
import Page from '@components/page'
import ListTeams from '@components/list-teams'
import GameScore from '@components/game-score'
import Button from '@components/button'
import { PickAvatar } from '@components/profile'
import { useLeaveGame } from '@components/settings'
import { IconArrow, IconCamera } from '@components/icons'
import AudioPreview from './AudioPreview.js'

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
      {/* <Stack.Screen name="settings-profile" component={SettingsSoundSk} /> */}
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
            onBlur={() => Papers.updateProfile({ name })}
          />
          <Text
            style={[Styles.alignLeft, Theme.typography.small, { marginTop: 24, marginBottom: 16 }]}
          >
            Help us out!
          </Text>
          {[
            {
              id: 'fb',
              title: 'Send feedback',
              icon: 'next',
              onPress: () => console.warn('TODO send feedback'),
            },
            {
              id: 'donation',
              title: 'Buy us a beer',
              onPress: () => logEvent('click', { type: 'buy a beer!' }),
            },
            {
              id: 'reset',
              title: 'Delete account',
              variant: 'danger',
              onPress: handleDeleteAccount,
            },
          ].map(item => (
            <Item key={item.id} {...item} />
          ))}
          <View style={[{ marginTop: 32, marginBottom: 32 }]}>
            <AudioPreview />
            <Text>{'\n'}</Text>
            <TestCrashing />
            <Text>{'\n'}</Text>
            <OtaChecker />
            <Text style={[Theme.typography.small, Theme.u.center]}>
              @2020 - V.{about.version} OTA@{about.ota}
            </Text>
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

function SettingsPlayers({ navigation }) {
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
    // If you find a better way of doing this. Please let me know.
    // I spent 3h googling it and didn't found a way.
    updateHeaderBackBtn({
      title: 'Players',
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

SettingsPlayers.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

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
    backgroundColor: Theme.colors.grayLight,
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
    marginBottom: 10,
    paddingVertical: 10,
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
    <TouchableOpacity style={Styles.group} onPress={onPress}>
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
        {icon && <IconArrow size={20} />}
      </View>
    </TouchableOpacity>
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
      <View style={{ marginVertical: 8 }}>
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

  async function handleCheckClick() {
    setstatus('error')
  }

  return (
    <View>
      <Button variant="light" onPress={handleCheckClick}>
        Force error crash
      </Button>
      {status === 'error' && <View>Cabbom!!</View>}
    </View>
  )
}
