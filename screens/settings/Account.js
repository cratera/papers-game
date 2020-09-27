import React from 'react'
import { StyleSheet, ScrollView, View, Text, TextInput } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'

import { AvatarField } from '@components/avatar'
import Item from './Item.js'
import { useSubHeader, propTypesCommon } from './utils'

export default function SettingsAccount({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile } = Papers.state
  useSubHeader(navigation, 'Account')

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <View style={[Styles.avatarBox]}>
              <AvatarField
                avatar={profile.avatar}
                onChange={avatar => Papers.updateProfile({ avatar })}
              />
            </View>
            <View style={Theme.u.listDivider} />

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
            <View style={Theme.u.listDivider} />
            <Item
              id="del"
              title="Delete account"
              icon="next"
              onPress={() => navigation.navigate('settings-accountDeletion')}
            />
            <View style={Theme.u.listDivider} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsAccount.propTypes = propTypesCommon

const Styles = StyleSheet.create({
  avatarBox: {
    paddingVertical: 8,
  },
  input: {
    borderColor: 'transparent',
    borderWidth: 0,
    padding: 20,
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
