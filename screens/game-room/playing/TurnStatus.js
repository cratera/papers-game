import React from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import Avatar from '@components/avatar'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const TurnStatus = ({ title, player, teamName }) => (
  <View style={Styles.tst}>
    <Text style={Theme.typography.h3}>{title}</Text>
    <View style={Styles.tst_flex}>
      <Avatar hasMargin size="lg" src={player.avatar} />
      <View>
        <Text style={Theme.typography.h3}>{player.name}</Text>
        <Text style={[Theme.typography.secondary, Styles.tst_team]}>{teamName}</Text>
      </View>
    </View>
  </View>
)

TurnStatus.propTypes = {
  title: PropTypes.string.isRequired,
  player: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  teamName: PropTypes.string.isRequired,
}

export default TurnStatus
