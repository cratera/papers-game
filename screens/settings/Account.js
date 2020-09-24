import React from 'react'
import { StyleSheet, ScrollView, View, Text, TextInput, Alert, Platform } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'

import AvatarSquare from './AvatarSquare.js'
import Item from './Item.js'

export default function SettingsAccount({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile } = Papers.state

  async function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      if (window.confirm(`This will delete your profile locally and from Papers' servers?`)) {
        await Papers.resetProfile()
        navigation.dangerouslyGetParent().reset({
          index: 0,
          routes: [{ name: 'home' }],
        })
      }
    } else {
      Alert.alert(
        'Delete profile',
        "This will delete your profile locally and from Papers' servers",
        [
          {
            text: 'Delete profile',
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
            onPress: () => true,
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <View style={[Styles.avatarBox]}>
              <AvatarSquare
                avatar={profile.avatar}
                style={Styles.avatar}
                size={120}
                onChange={avatar => Papers.updateProfile({ avatar })}
              />
            </View>
            <View style={Styles.listSpacer} />

            <View style={[Theme.u.flexBetween, Styles.field]}>
              <Text nativeID="inputNameLabel" style={[Styles.alignLeft, Theme.typography.body]}>
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
            </View>

            <Item
              id="privacy"
              title="Privacy"
              icon="next"
              onPress={() => navigation.navigate('settings-privacy')}
            />
            <View style={Styles.listSpacer} />
            <Item
              id="del"
              title="Delete profile"
              icon="next"
              // onPress={() => navigation.navigate('settings-account_delete')}
              onPress={handleDeleteAccount}
            />
            <View style={Styles.listSpacer} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsAccount.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

const Styles = StyleSheet.create({
  avatarBox: {
    paddingBottom: 8,
  },
  listSpacer: {
    height: 8,
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  input: {
    borderColor: 'transparent',
    borderWidth: 0,
    padding: 24,
    paddingRight: 8,
    marginTop: 4,
    fontSize: 16,
    flexGrow: 1,
    textAlign: 'right',
    color: Theme.colors.grayMedium,
    backgroundColor: Theme.colors.bg,
  },
  field: {
    paddingHorizontal: 16,
  },
})
