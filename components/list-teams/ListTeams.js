import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Text } from 'react-native'

import PapersContext from '@store/PapersContext.js'
import ListPlayers from '@components/list-players'

import * as Theme from '@theme'

export default function ListTeams({ isStatusVisible, ...otherProps }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state

  if (!game) {
    // TODO add global warning.
    return <Text>Ups, game not found.</Text>
  }

  if (!game.teams) {
    return (
      <ListPlayers
        players={Object.keys(game.players)}
        enableKickout
        isStatusVisible={isStatusVisible}
        {...otherProps}
      />
    )
  }

  return (
    <View {...otherProps}>
      {Object.keys(game.teams).map(teamId => {
        const { id, name, players } = game.teams[teamId]
        return (
          <View key={id} style={Styles.team}>
            <Text style={Theme.typography.h3}>{name}</Text>
            <ListPlayers players={players} enableKickout isStatusVisible={isStatusVisible} />
          </View>
        )
      })}
    </View>
  )
}

ListTeams.propTypes = {
  isStatusVisible: PropTypes.bool,
  enableKickout: PropTypes.bool,
}

const Styles = StyleSheet.create({
  team: {
    marginTop: 8,
    marginBottom: 40,
  },
})
