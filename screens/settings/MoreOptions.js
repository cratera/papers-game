import React from 'react'
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'

import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'
import Item from './Item.js'

export default function MoreOptions({ navigation, list }) {
  const Papers = React.useContext(PapersContext)
  const { about } = Papers.state

  return (
    <>
      <View style={[Theme.u.cardEdge, { paddingTop: 8 }]}>
        {[
          {
            id: 'sd',
            title: 'Sound & Animations',
            icon: 'next',
            onPress: () => navigation.navigate('settings-sound'),
          },
          {
            id: 'fb',
            title: 'Feedback',
            icon: 'next',
            onPress: () => navigation.navigate('settings-feedback'),
          },
          {
            id: 'pg',
            title: 'Experimental',
            icon: 'next',
            onPress: () => navigation.navigate('settings-experimental'),
          },
          ...list,
        ].map(item => (
          <Item key={item.id} {...item} />
        ))}
        <View style={Styles.listSpacer} />
      </View>

      <View style={[{ marginTop: 16 }]}>
        <Text style={[Theme.typography.small, { color: Theme.colors.grayDark }]}>
          Made with 🖤 by Maggie and Sandy.
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 8 }}>
          <Text style={[Theme.typography.small]}>
            Papers version {about.version}@{about.ota} ∙
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('settings-credits')}>
            <Text
              style={[
                Theme.typography.small,
                Theme.u.center,
                { color: Theme.colors.grayDark, textDecorationLine: 'underline', marginLeft: 4 },
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
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
})
