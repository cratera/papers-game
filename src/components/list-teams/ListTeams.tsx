import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ListPlayers from '@src/components/list-players'
import PapersContext from '@src/store/PapersContext'

import { Team, TeamId } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import { ListTeamsProps } from './ListTeams.types'

export default function ListTeams({ isStatusVisible, enableKickout, ...props }: ListTeamsProps) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const didSubmitAllWords = (plId: string) => game?.words && game.words[plId]

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
        {...props}
      />
    )
  }

  return (
    <View {...props}>
      {Object.keys(game.teams).map((team) => {
        const teamId = Number(team) as TeamId

        const { id, name, players } = (game.teams && game.teams[teamId]) as Team
        const playersList = isStatusVisible ? Object.values(players) : []
        const total = isStatusVisible && playersList?.length
        const done = isStatusVisible && playersList?.filter(didSubmitAllWords).length
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
