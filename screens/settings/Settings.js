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
} from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'
import ListTeams from '@components/list-teams'

import { PickAvatarModal } from '@components/profile'
import { useLeaveGame } from '@components/settings'
import { headerTheme } from '@navigation/headerStuff.js'

const Stack = createStackNavigator()

export default function Settings(props) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state

  React.useEffect(() => {
    props.navigation.setOptions({
      ...headerTheme(),
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
  const { profile } = Papers.state

  return (
    <Page>
      <Page.Main>
        <ScrollView>
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
              icon: '👉',
              onPress: () => console.warn('TODO send feedback'),
            },
            {
              id: 'donation',
              title: 'Buy us a beer',
              onPress: () => console.warn('TODO buy us a better'),
            },
            {
              id: 'reset',
              title: 'Delete account',
              variant: 'danger',
              onPress: async () => {
                await Papers.resetProfile()
                navigation.dangerouslyGetParent().reset({
                  index: 0,
                  routes: [{ name: 'home' }],
                })
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
            style={[Theme.typography.h2, Theme.u.center, { marginTop: 24 }]}
            accessibilityRole="header"
          >
            {game.name}
          </Text>
          <Text
            style={{
              marginVertical: 16,
              padding: 24,
              paddingVertical: 70,
              borderColor: '#4cc',
              borderWidth: 5,
              textAlign: 'center',
            }}
          >
            [TODO: Game Score]
          </Text>
          {/* BUG FlatList: https://github.com/GeekyAnts/NativeBase/issues/2947 */}
          {[
            {
              id: 'pl',
              title: 'Players',
              icon: '👉',
              onPress: () => {
                // console.warn('TODO navigate to settings-player')
                // TODO find a way to navigate correctly in nested routes...
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
          <Page.HeaderBtn side="left" onPress={onPress}>
            👈{btnText}
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
      btnText: 'Settings',
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
      <Page.Main>
        <ScrollView>
          <ListTeams />
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
    marginBottom: 8,
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
      <Text style={[StylesAv.icon]}>📸</Text>
      <PickAvatarModal
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
    // backgroundColor: Theme.colors.primary,
    // width: 20,
    // height: 20,
    // borderRadius: 4,
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
        <Text>{icon}</Text>
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
