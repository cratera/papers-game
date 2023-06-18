import React from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import AvatarSelector from '@src/components/avatar/AvatarSelector'
import Page from '@src/components/page'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Profile } from '@src/store/PapersContext.types'
import Item from './Item'
import { useSubHeader } from './utils'

export default function SettingsAccount({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings'>) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile } = Papers.state
  const defaultAvatar = React.useRef(profile?.avatar).current
  useSubHeader(navigation, 'Account')

  function handleOnSelectorChange(avatar: Profile['avatar']) {
    Papers.updateProfile({ avatar })
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <View style={Theme.utils.cardEdge}>
            <AvatarSelector
              value={profile?.avatar || 'abraul'}
              defaultValue={defaultAvatar}
              onChange={handleOnSelectorChange}
            />

            <View style={Theme.utils.listDivider} />

            <View style={[Theme.utils.flexBetween, Styles.field]}>
              <Text nativeID="inputNameLabel" style={Theme.typography.body}>
                Name
              </Text>
              <TextInput
                style={Styles.input}
                inputAccessoryViewID="name"
                nativeID="inputNameLabel"
                defaultValue={profile?.name}
                maxLength={10}
                returnKeyType="done"
                onChangeText={(text) => setName(text)}
                onBlur={() => name && Papers.updateProfile({ name })}
              />
            </View>
            <Item
              title="Statistics"
              icon="next"
              onPress={() => navigation.navigate('settings-statistics')}
            />
            <View style={Theme.utils.listDivider} />
            <Item
              id="del"
              title="Delete account"
              icon="next"
              onPress={() => navigation.navigate('settings-accountDeletion')}
            />
            <View style={Theme.utils.listDivider} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

const Styles = StyleSheet.create({
  input: {
    borderColor: Theme.colors.transparent,
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
