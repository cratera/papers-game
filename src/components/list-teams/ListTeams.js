import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ListPlayers from '@src/components/list-players'
import PapersContext from '@src/store/PapersContext'

import * as Theme from '@src/theme'

export default function ListTeams({ isStatusVisible, enableKickout, ...otherProps }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const didSubmitAllWords = (plId) => game?.words[plId]

  if (!game) {
    // TODO: add global warning.
    return <Text>Ups, game not found.</Text>
  }

  if (!game.teams) {
    return (
      <ListPlayers
        players={Object.keys(game.players)}
        enableKickout={enableKickout}
        isStatusVisible={isStatusVisible}
        {...otherProps}
      />
    )
  }

  return (
    <View {...otherProps}>
      {Object.keys(game.teams).map((teamId) => {
        const { id, name, players } = game.teams[teamId]
        const playersList = isStatusVisible && Object.values(players)
        const total = isStatusVisible && playersList.length
        const done = isStatusVisible && playersList.filter(didSubmitAllWords).length
        return (
          <View key={id} style={Styles.team}>
            <View style={Styles.header}>
              <Text style={Theme.typography.h3}>{name}</Text>
              {isStatusVisible && (
                <Text style={Theme.typography.secondary}>
                  {done} / {total}
                </Text>
              )}
            </View>
            <ListPlayers
              players={players}
              enableKickout={enableKickout}
              isStatusVisible={isStatusVisible}
            />
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
    marginBottom: 24,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
})
