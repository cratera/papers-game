import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

import * as Avatars from './Illustrations'

export default function Avatar({ src, alt, hasMargin, size, stroke, style, ...otherProps }) {
  const Avatar = Avatars[src]
  return (
    <View
      style={[
        Styles.avatar,
        { borderWidth: stroke },
        hasMargin && Styles.margin,
        Styles[`size_${size}`],
        style,
      ]}
      {...otherProps}
    >
      {Avatar && <Avatar />}
    </View>
  )
}

Avatar.defaultProps = {
  size: 'md',
  stroke: 2,
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  hasMargin: PropTypes.bool,
  style: PropTypes.any,
  size: PropTypes.oneOf(['md', 'lg', 'll', 'xl', 'xxl']),
  stroke: PropTypes.number,
}

const Styles = StyleSheet.create({
  avatar: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.grayDark,
  },
  margin: {
    marginRight: 16,
  },
  size_md: {
    width: 40,
    height: 40,
  },
  size_lg: {
    width: 56,
    height: 56,
  },
  size_ll: {
    width: 88,
    height: 88,
  },
  size_xl: {
    width: 104,
    height: 104,
  },
  size_xxl: {
    width: 120,
    height: 120,
  },
})
