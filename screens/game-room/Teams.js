import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { getRandomInt } from '@constants/utils'
import PapersContext from '@store/PapersContext.js'
import teamNames from '@store/teamNames.js'

import Page from '@components/page'
import Button from '@components/button'
import ListPlayers from '@components/list-players'

import { headerTheme } from '@navigation/headerStuff.js'
import * as Theme from '@theme'

function areTeamPlayersEqual(teamsOld, teamsNew) {
  const tOld = {}
  const tNew = {}

  for (const ix in teamsNew) {
    tNew[ix] = teamsNew[ix].players
  }
  for (const ix in teamsOld) {
    tOld[ix] = teamsOld[ix].players
  }

  const result = JSON.stringify(tOld) === JSON.stringify(tNew)
  return result
}

export default function Teams({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const playersCount = Object.keys(game.players).length
  const [tempTeams, setTeams] = React.useState(getRandomTeams)
  const [isLocking, setLocking] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState(null)
  const didMountRef = React.useRef(false)

  React.useEffect(() => {
    didMountRef.current = true
  }, [])

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme(),
      title: 'Teams',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" icon="back" onPress={navigation.goBack}>
            Back
          </Page.HeaderBtn>
        )
      },
      headerRight: null,
    })
  }, [])

  React.useEffect(() => {
    if (didMountRef.current) {
      // When someone just joined/left...
      generateTeams()
    }
  }, [playersCount])

  // TODO later This could be useRandomTeams()
  function getRandomTeams() {
    const players = Object.keys(game.players)
    const teamsNr = 2 // LATER - Game Setting
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
        name: teamNames[getRandomInt(teamNames.length - 1)],
        players: team,
      }

      if (index === 1 && newTempTeams[1].name === newTempTeams[0].name) {
        console.log('Teams with same name. Get new one.')
        newTempTeams[1].name = teamNames[getRandomInt(teamNames.length - 1)]
      }
    })

    if (areTeamPlayersEqual(tempTeams, newTempTeams)) {
      console.log('Equal teams. Randomize again.')
      return getRandomTeams()
    } else {
      return newTempTeams
    }
  }

  function generateTeams() {
    setTeams(getRandomTeams())
  }

  // function handleRenameOf(teamId) {
  //   try {
  //     var name = window.prompt('Choose a sweet name.', tempTeams[teamId].name)
  //     if (name !== null) {
  //       setTeams(teams => ({
  //         ...teams,
  //         [teamId]: {
  //           ...teams[teamId],
  //           name,
  //         },
  //       }))
  //     }
  //   } catch {
  //     console.warn('TODO rename teams on IOS')
  //   }
  // }

  async function handleLockClick() {
    if (isLocking) return false
    setErrorMsg(null)
    setLocking(true)

    try {
      await Papers.setTeams(tempTeams)
      navigation.setOptions({ headerRight: null })
      navigation.navigate('write-papers')
    } catch (e) {
      console.warn('setTeams failed', e)
      setErrorMsg(e.message)
      setLocking(false)
    }
  }

  return (
    <Page bannerMsg={errorMsg}>
      <Page.Main>
        <ScrollView style={Theme.u.scrollSideOffset} contentContainerStyle={{ paddingBottom: 16 }}>
          {Object.keys(tempTeams).map(teamId => {
            const { id, name, players } = tempTeams[teamId]

            // REVIEW DESIGN - Small flickr when changing teams.
            return (
              <View key={id} style={Styles.team}>
                <View style={Styles.headerTeam}>
                  <Text style={Theme.typography.h2}>{name}</Text>
                  {/* <Button
                    variant="icon"
                    accessibilityLabel="Rename team"
                    onPress={() => handleRenameOf(id)}
                  >
                    ✏️
                  </Button> */}
                </View>
                <ListPlayers players={players} />
              </View>
            )
          })}
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset>
        <Button variant="light" onPress={generateTeams} styleTouch={{ marginBottom: 16 }}>
          Randomize teams
        </Button>
        <Button onPress={handleLockClick} isLoading={isLocking}>
          Lock teams
        </Button>
      </Page.CTAs>
    </Page>
  )
}

Teams.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
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
    marginTop: 16,
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
})
