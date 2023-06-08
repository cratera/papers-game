import * as Linking from 'expo-linking'
import React from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import PropTypes from 'prop-types'

import { IconExternal } from '@src/components/icons'
import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'
import { isDebugging } from '@src/utils/misc'
import Item from './Item.js'

export default function MoreOptions({ navigation, list }) {
  const Papers = React.useContext(PapersContext)
  const { profile, about } = Papers.state

  return (
    <>
      <View style={[Theme.utils.cardEdge, { paddingTop: 8 }]}>
        {[
          {
            id: 'sd',
            title: 'Sound & animations',
            icon: 'next',
            onPress: () => navigation.navigate('settings-sound'),
          },
          Platform.OS === 'web'
            ? {
                id: 'dn',
                title: 'Buy us a coffee!',
                Icon: IconExternal,
                onPress: () => {
                  // TODO: this
                  Linking.openURL('https://google.com')
                },
              }
            : {
                id: 'pay',
                title: 'Buy Papers (no ads)',
                icon: 'next',
                onPress: () => navigation.navigate('settings-purchases'),
              },
          {
            id: 'fb',
            title: 'Feedback',
            icon: 'next',
            onPress: () => navigation.navigate('settings-feedback'),
          },
          {
            id: 'pg',
            title: 'Privacy',
            icon: 'next',
            onPress: () => navigation.navigate('settings-privacy'),
          },
          ...(isDebugging(profile.name)
            ? [
                {
                  id: 'xp',
                  title: 'Experimental',
                  icon: 'next',
                  onPress: () => navigation.navigate('settings-experimental'),
                },
              ]
            : []),
          ...list,
        ].map((item) => (
          <Item key={item.id} {...item} />
        ))}
        {/* <View style={Styles.listSpacer} /> */}
      </View>

      <View style={Styles.footer}>
        <Text style={[Theme.typography.small, { color: Theme.colors.grayDark }]}>
          Made with 🖤 by Maggie and Sandy.
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 8 }}>
          <Text style={Theme.typography.small}>
            Version {about.version}@{about.ota} ∙
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('settings-credits')}>
            <Text
              style={[
                Theme.typography.small,
                Theme.utils.center,
                { textDecorationLine: 'underline', marginLeft: 4 },
              ]}
            >
              Acknowledgments
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

MoreOptions.defaultProps = {
  list: [],
}

MoreOptions.propTypes = {
  navigation: PropTypes.object,
  list: PropTypes.array,
}

const Styles = StyleSheet.create({
  listSpacer: {
    height: 8,
    borderBottomColor: Theme.colors.grayLight,
    borderBottomWidth: 1,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})
