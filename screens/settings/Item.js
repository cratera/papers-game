import React from 'react'
import { StyleSheet, TouchableHighlight, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import { IconArrow } from '@components/icons'

import * as Theme from '@theme'

export default function Item({ title, icon, variant, hasDivider, onPress }) {
  return (
    <TouchableHighlight underlayColor={Theme.colors.grayLight} onPress={onPress}>
      <View
        style={[
          Styles.item,
          // {
          //   borderBottomColor: Theme.colors.grayDark,
          //   borderBottomWidth: hasDivider ? 1 : 0,
          // },
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
        {icon ? <IconArrow size={20} /> : null}
      </View>
    </TouchableHighlight>
  )
}

Item.propTypes = {
  title: PropTypes.string.isRequired,
  hasDivider: PropTypes.bool,
  variant: PropTypes.oneOf(['danger']),
  icon: PropTypes.node,
  onPress: PropTypes.func,
}

const Styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    // backgroundColor: Theme.colors.yellow,
  },
})
