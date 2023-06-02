import PropTypes from 'prop-types'
import React from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import PapersContext from '@src/store/PapersContext.js'
import * as Theme from '@src/theme'

import { IconPencil } from '@src/components/icons'
import Page from '@src/components/page'

import Avatar from '@src/components/avatar'
import MoreOptions from './MoreOptions.js'
import { useSubHeader } from './utils'

export default function SettingsProfile({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const refInputName = React.useRef()
  const [name, setName] = React.useState('')
  const { profile } = Papers.state

  useSubHeader(navigation, 'Settings', { isEntry: true })

  function handleNameLabelPress() {
    refInputName.current.focus()
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.utils.scrollSideOffset, { paddingTop: 0 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={Theme.utils.cardEdge}
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
          <View style={Theme.utils.flexBetween}>
            <TouchableOpacity style={Styles.inputLabel} onPress={handleNameLabelPress}>
              <Text nativeID="inputNameLabel" style={[Theme.typography.body, Styles.inputLabel]}>
                Name
              </Text>
            </TouchableOpacity>
            <TextInput
              ref={refInputName}
              style={Styles.input}
              inputAccessoryViewID="name"
              nativeID="inputNameLabel"
              defaultValue={profile.name}
              maxLength={10}
              returnKeyType="done"
              onChangeText={(text) => setName(text)}
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
    marginTop: 16,
    marginBottom: 8 + 8,
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
  inputLabel: {
    paddingVertical: 7,
    flexGrow: 1,
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
