import React from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import Avatar from '@components/avatar'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const TurnStatus = ({ title, player, teamName, style }) => (
  <View style={[Styles.tst, style]}>
    <Text style={Theme.typography.h3}>{title}</Text>
    <View style={Styles.tst_flex}>
      <Avatar hasMargin size="lg" src={player.avatar} alt="" />
      <View>
        <Text style={Theme.typography.h3}>{player.name}</Text>
        <Text style={[Theme.typography.small, Styles.tst_team]}>{teamName}</Text>
      </View>
    </View>
  </View>
)

// TODO - Refactor these naming props...
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
