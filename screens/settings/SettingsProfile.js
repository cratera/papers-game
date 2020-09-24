import React from 'react'
import { StyleSheet, TouchableHighlight, ScrollView, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import Page from '@components/page'
import { IconArrow } from '@components/icons'

import AvatarSquare from './AvatarSquare.js'
import MoreOptions from './MoreOptions.js'

export default function SettingsProfile({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile } = Papers.state

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset, { paddingTop: 0 }]}>
          <TouchableHighlight
            style={Theme.u.cardEdge}
            underlayColor={Theme.colors.primaryLight}
            onPress={() => navigation.navigate('settings-account')}
          >
            <View style={Styles.accountTap}>
              <AvatarSquare style={Styles.accountTap_avatar} avatar={profile.avatar} />
              <View style={{ flexGrow: 1 }}>
                <Text style={[Theme.typography.small]}>Account</Text>
                <Text style={[Theme.typography.body]}>{profile.name}</Text>
              </View>
              <IconArrow size={20} style={{ marginRight: 16 }} />
            </View>
          </TouchableHighlight>
          <MoreOptions navigation={navigation} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -1,
    borderBottomColor: Theme.colors.grayDark,
    borderTopColor: Theme.colors.grayDark,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  accountTap_avatar: {
    marginRight: 16,
    marginTop: -1, // to hide double border
    marginBottom: -1,
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
