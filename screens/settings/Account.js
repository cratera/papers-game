import React from 'react'
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import { window } from '@constants/layout'
import Page from '@components/page'
import * as Avatars from '@components/avatar/Illustrations'

import Item from './Item.js'
import { useSubHeader, propTypesCommon } from './utils'

// eslint-disable-next-line react/prop-types
function AvatarBtn({ AvatarSvg, onPress, isActive, ...props }) {
  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <AvatarSvg style={[Styles.avatarItem, isActive && Styles.avatarItem_active]} />
    </TouchableOpacity>
  )
}

export default function SettingsAccount({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile } = Papers.state
  useSubHeader(navigation, 'Account')
  const avatarDefault = React.useRef({
    key: profile.avatar,
    Svg: Avatars[profile.avatar],
  }).current
  const AvatarDefaultSvg = avatarDefault.Svg
  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            <ScrollView horizontal style={[Styles.avatarBox]}>
              {/* Show default/initial avatar in first place, always. */}
              <AvatarBtn
                AvatarSvg={AvatarDefaultSvg}
                isActive={avatarDefault.key === profile.avatar}
                onPress={() => Papers.updateProfile({ avatar: avatarDefault.key })}
              />

              {Object.keys(Avatars).map(key => {
                const AvatarSvg = Avatars[key]
                if (key === avatarDefault.key) return null
                return (
                  <AvatarBtn
                    AvatarSvg={AvatarSvg}
                    key={key}
                    isActive={key === profile.avatar}
                    onPress={() => Papers.updateProfile({ avatar: key })}
                  />
                )
              })}
            </ScrollView>
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
                maxLength={10}
                returnKeyType="done"
                onChangeText={text => setName(text)}
                onBlur={() => name && Papers.updateProfile({ name })}
              />
            </View>
            <Item
              title="Statistics"
              icon="next"
              onPress={() => navigation.navigate('settings-statistics')}
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

const { vw } = window

const Styles = StyleSheet.create({
  avatarBox: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 4,
    paddingTop: 4,
    paddingBottom: 8,
  },
  avatarItem: {
    width: vw * 26,
    height: vw * 26,
    marginRight: 8,
    borderWidth: 4,
    borderColor: 'transparent',
    // opacity: 0.9,
  },
  avatarItem_active: {
    borderColor: Theme.colors.grayDark,
    // opacity: 1,
  },
  input: {
    borderColor: 'transparent',
    borderWidth: 0,
    padding: 20,
    paddingRight: 8,
    marginTop: 4,
    fontSize: Theme.fontSize.base,
    flexGrow: 1,
    textAlign: 'right',
    color: Theme.colors.grayMedium,
    backgroundColor: Theme.colors.bg,
  },
  field: {
    paddingHorizontal: 16,
  },
})
