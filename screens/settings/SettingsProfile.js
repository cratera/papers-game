import React from 'react'
import { StyleSheet, TouchableOpacity, ScrollView, View, Text, TextInput } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'
import { IconPencil } from '@components/icons'

import Avatar from '@components/avatar'
import MoreOptions from './MoreOptions.js'
import { useSubHeader } from './utils'

export default function SettingsProfile({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [name, setName] = React.useState('')
  const { profile } = Papers.state

  useSubHeader(navigation, 'Settings')

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset, { paddingTop: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={Theme.u.cardEdge}
            onPress={() => navigation.navigate('settings-profile-avatar')}
          >
            <View style={Styles.accountTap}>
              <Avatar
                style={Styles.accountTap_avatar}
                src={profile.avatar}
                size="xxl"
                stroke={1}
                alt=""
              />
              <View style={Styles.accountTap_avatarIcon}>
                <IconPencil size={24} color={Theme.colors.bg} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={[Theme.u.flexBetween]}>
            <Text nativeID="inputNameLabel" style={Theme.typography.body}>
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
          <MoreOptions
            navigation={navigation}
            list={[
              {
                id: 'del',
                title: 'Delete account',
                onPress: () => navigation.navigate('settings-accountDeletion'),
                variant: 'danger',
                hasDivider: true,
              },
            ]}
          ></MoreOptions>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsProfile.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}

const Styles = StyleSheet.create({
  accountTap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  accountTap_avatar: {},
  accountTap_avatarIcon: {
    width: 32,
    height: 32,
    backgroundColor: Theme.colors.grayDark,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16 - 8,
    marginLeft: '50%',
    transform: [{ translateX: -16 - 8 }],
  },
  input: {
    borderColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 12,
    paddingRight: 6,
    marginTop: 4,
    fontSize: Theme.fontSize.base,
    color: Theme.colors.grayMedium,
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
