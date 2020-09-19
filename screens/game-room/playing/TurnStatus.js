import React from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import Avatar from '@components/avatar'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const TurnStatus = ({ title, player, teamName, style }) => (
  <View style={[Styles.tst_flex, style]}>
    <Text style={[Theme.typography.secondary, Styles.tst_flex_title]}>{title}</Text>
    <Avatar size="xl" src={player.avatar} alt="" />
    <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 24, marginBottom: 8 }]}>
      {title || player.name}
    </Text>
    <Text style={[Theme.typography.secondary, Theme.u.center]}>{teamName}</Text>
  </View>
)

// TODO later - Improve these props names (e.g. teamName does not make sense).
TurnStatus.propTypes = {
  title: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  player: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  teamName: PropTypes.string.isRequired,
}

export default TurnStatus
