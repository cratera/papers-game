import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { getRandomInt } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'

import Page from '@components/page'
import Button from '@components/button'
import { IconEdit } from '@components/icons'
import ListPlayers from '@components/list-players'

import * as Theme from '@theme'

const Title = () => (
  <Text style={[Theme.typography.small, Theme.u.center, { marginBottom: 16 }]}>Create teams</Text>
)

export default function Teams({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const PaperTeams = Papers.teams
  const { game } = Papers.state
  const [tempTeams, setTeams] = React.useState(PaperTeams || getRandomTeams())

  function backToLobby() {
    navigation.navigate('lobby')
  }

  function getRandomTeams() {
    const players = Object.keys(game.players)
    const teamsNr = 2 // LATER - game setting
    const teams = Array.from(Array(teamsNr), () => [])
    const limit = Math.round(players.length / teamsNr)
    const newTempTeams = {}

    function alocateTo(teamIndex, playerId) {
      if (teams[teamIndex].length === limit) {
        const newIndex = teamIndex === teamsNr - 1 ? 0 : teamIndex + 1
        alocateTo(newIndex, playerId)
      } else {
        teams[teamIndex].push(playerId)
      }
    }

    for (const playerId of players) {
      const teamIndex = getRandomInt(teamsNr - 1)
      alocateTo(teamIndex, playerId)
    }

    teams.forEach((team, index) => {
      newTempTeams[index] = {
        id: index,
        // TODO @mmbotelho - Funny teams names
        name: `Team ${String.fromCharCode(index + 65)}`, // 65 = A
        players: team,
      }
    })

    if (JSON.stringify(newTempTeams) === JSON.stringify(tempTeams)) {
      console.log('Generateed equal teams. Generating again...')
      generateTeams()
    } else {
      return newTempTeams
    }
  }

  function generateTeams() {
    setTeams(getRandomTeams)
  }

  function handleRenameOf(teamId) {
    try {
      var name = window.prompt('Choose a sweet name.', tempTeams[teamId].name)
      if (name !== null) {
        setTeams(teams => ({
          ...teams,
          [teamId]: {
            ...teams[teamId],
            name,
          },
        }))
      }
    } catch {
      console.warn('TODO rename teams on IOS')
    }
  }

  function submitTeamsAndGoNext() {
    Papers.setTeams(tempTeams)
  }

  return (
    <Page>
      <Page.Header>
        <Button style={Styles.backBtn} variant="flat" onPress={backToLobby}>
          Back to lobby
        </Button>
      </Page.Header>
      <Page.Main>
        <ScrollView style={Theme.u.scrollSideOffset}>
          <Title />
          {Object.keys(tempTeams).map(teamId => {
            const { id, name, players } = tempTeams[teamId]

            return (
              <View key={id} style={Styles.team}>
                <View style={Styles.headerTeam}>
                  <Text style={Theme.typography.h2}>{name}</Text>
                  <Button
                    variant="icon"
                    accessibilityLabel="Rename team"
                    onPress={() => handleRenameOf(id)}
                  >
                    ✏️
                    {/* Icon width/height isn't working on IOS. FML. */}
                    {/* <IconEdit style={Styles.btnEdit_icon} />  */}
                  </Button>
                </View>
                <ListPlayers players={players} />
              </View>
            )
          })}
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset>
        <Button variant="light" onPress={generateTeams} styleTouch={{ marginBottom: 16 }}>
          Create a different random team
        </Button>
        <Button onPress={submitTeamsAndGoNext}>Next: Write your 10 papers!</Button>
      </Page.CTAs>
    </Page>
  )
}

Teams.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func, // (componentName: String)
  }),
}

const Styles = StyleSheet.create({
  cta: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: 10,
    overflow: 'hidden', // so borderRadius works.
    marginTop: 8,
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  cta_icon: {
    marginBottom: 48,
    color: Theme.colors.primary,
  },
  cta_txt: {
    fontSize: 16,
    color: Theme.colors.primary,
  },
  headerTeam: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // btnEdit: {
  //   color: Theme.colors.primary,
  //   textAlign: 'center',
  // },
  // btnEdit_icon: {
  //   width: 17,
  //   height: 17,
  //   position: 'absolute',
  //   top: 10,
  //   left: 10,
  // },
  team: {},
})
