import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { analytics as Analytics } from '@src/services/firebase'
// import Bubbling from '@src/components/bubbling'
import { LoadingBadge } from '@src/components/loading'

import PapersContext from '@src/store/PapersContext'
import teamNames from '@src/store/teamNames'
import { getRandomInt } from '@src/utils/misc'

import Button from '@src/components/button'
import ListPlayers from '@src/components/list-players'
import Page from '@src/components/page'

import { headerTheme } from '@src/navigation/headerStuff'
import * as Theme from '@src/theme'

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

const bgStart = 'bg' // yellow
const bgEnd = 'bg' // pink

export default function Teams({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const playersCount = Object.keys(game.players).length
  const [tempTeams, setTeams] = React.useState(getRandomTeams)
  const [isLocking, setLocking] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState(null)
  const didMountRef = React.useRef(false)
  const [isFakingLoading, setIsFakingLoading] = React.useState(true) // useFakeLoading

  React.useEffect(() => {
    setTimeout(() => {
      if (didMountRef.current) setIsFakingLoading(false)
    }, 1500)
  }, [])

  React.useEffect(() => {
    didMountRef.current = true

    return () => {
      didMountRef.current = false
    }
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
    Analytics.setCurrentScreen('game_teams_creation')
  }, [])

  React.useEffect(() => {
    if (didMountRef.current) {
      // When someone just joined/left...
      generateTeams()
    }
  }, [playersCount])

  // TODO: later This could be hook useRandomTeams()
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
        if (__DEV__) console.log('Teams with same name. Get new one.')
        newTempTeams[1].name = teamNames[getRandomInt(teamNames.length - 1)]
      }
    })

    if (areTeamPlayersEqual(tempTeams, newTempTeams)) {
      if (__DEV__) console.log('Equal teams. Randomize again.')
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
  //     console.warn('TODO: rename teams on IOS')
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
      setErrorMsg(e.message)
      setLocking(false)
    }
  }

  if (isFakingLoading) {
    return (
      <Page bannerMsg={errorMsg} bgFill={bgStart}>
        <Page.Main headerDivider>
          <LoadingBadge variant="page">Creating teams</LoadingBadge>
        </Page.Main>
      </Page>
    )
  }

  return (
    <Page bannerMsg={errorMsg} bgFill={bgEnd}>
      {/* <Bubbling bgStart={bgStart} bgEnd={bgEnd} /> */}
      <Page.Main headerDivider>
        <ScrollView
          style={Theme.utils.scrollSideOffset}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {Object.keys(tempTeams).map((teamId) => {
            const { id, name, players } = tempTeams[teamId]

            return (
              <View key={id} style={Styles.team}>
                <View style={Styles.teamHeader}>
                  <View style={Styles.teamHeader_title}>
                    <Text style={Theme.typography.h2}>{name}</Text>
                    {/* <Button
                        variant="icon"
                        accessibilityLabel="Rename team"
                        onPress={() => handleRenameOf(id)}
                        >
                        ✏️
                      </Button> */}
                  </View>
                  <Text style={Theme.typography.secondary}>Team {teamId + 1}</Text>
                </View>
                <ListPlayers players={players} />
              </View>
            )
          })}
          <View style={Theme.utils.CTASafeArea} />
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset style={Styles.ctas}>
        <Button
          variant="icon"
          size="lg"
          style={Styles.ctas_random}
          accessibilityLabel="Randomize teams"
          onPress={generateTeams}
          styleTouch={{ marginBottom: 16 }}
        >
          <Text>🎲</Text>
        </Button>
        <Button
          size="lg"
          styleTouch={Styles.ctas_submit}
          place="float"
          onPress={handleLockClick}
          isLoading={isLocking}
        >
          Use these teams
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
    fontSize: Theme.fontSize.base,
    color: Theme.colors.primary,
  },
  teamHeader: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 16,
    marginBottom: 16,
  },
  teamHeader_title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
  },
  ctas_random: {
    backgroundColor: Theme.colors.grayDark,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    marginRight: 8,
  },
  ctas_submit: {
    flexGrow: 1,
  },
})
