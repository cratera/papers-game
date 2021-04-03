import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

import * as avatars from './Illustrations'

export default function Avatar({ src, isAfk, hasMargin, size, stroke, style, ...otherProps }) {
  const avatar = avatars[src]
  const Illustration = avatar?.Component
  return (
    <View
      style={[
        Styles.avatar,
        {
          backgroundColor: avatar?.bgColor,
        },
        // { borderWidth: stroke },
        hasMargin && Styles.margin,
        Styles[`size_${size}`],
        style,
      ]}
      {...otherProps}
    >
      {isAfk ? <Text style={Styles.afk}>...</Text> : Illustration && <Illustration />}
    </View>
  )
}

Avatar.defaultProps = {
  size: 'md',
  stroke: 2,
}

Avatar.propTypes = {
  src: PropTypes.string,
  hasMargin: PropTypes.bool,
  style: PropTypes.any,
  size: PropTypes.oneOf(['md', 'lg', 'll', 'xl', 'xxl']),
  stroke: PropTypes.number,
  /** Show loading/pending status instead of the avatar */
  isAfk: PropTypes.bool,
}

const Styles = StyleSheet.create({
  avatar: {
    // backgroundColor: Theme.colors.primaryLight,
    // borderColor: Theme.colors.grayDark,
    borderRadius: 12,
  },
  margin: {
    marginRight: 16,
  },
  size_md: {
    width: 40,
    height: 40,
  },
  size_lg: {
    width: 64,
    height: 64,
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
    width: 152,
    height: 152,
  },
  size_xxxl: {
    width: 295,
    height: 295,
  },
  afk: {
    fontSize: 25,
    lineHeight: 52, // hardcoded for size_lg :x
    fontFamily: 'YoungSerif-Regular',
    color: Theme.colors.bg,
    textAlign: 'center',
  },
})
