import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import * as Analytics from '@constants/analytics.js'
import Bubbling from '@components/bubbling'
import LoadingBadge from '@components/LoadingBadge.js'

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

const bgStart = Theme.colors.yellow
const bgEnd = Theme.colors.pink

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
      setErrorMsg(e.message)
      setLocking(false)
    }
  }

  if (isFakingLoading) {
    return (
      <Page bannerMsg={errorMsg} bgFill={bgStart}>
        <Page.Main headerDivider>
          <LoadingBadge>Creating teams</LoadingBadge>
        </Page.Main>
      </Page>
    )
  }

  return (
    <Page bannerMsg={errorMsg} bgFill={bgEnd}>
      <Bubbling bgStart={bgStart} bgEnd={bgEnd} />
      <Page.Main headerDivider>
        <ScrollView
          style={[Theme.u.scrollSideOffset]}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {Object.keys(tempTeams).map(teamId => {
            const { id, name, players } = tempTeams[teamId]

            return (
              <View key={id} style={Styles.team}>
                <View style={[Styles.teamHeader, Theme.u.cardEdge]}>
                  <Text style={Theme.typography.secondary}>Team {'0' + (+teamId + 1)}</Text>
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
                </View>
                <ListPlayers players={players} />
              </View>
            )
          })}
          <View style={Theme.u.CTASafeArea} />
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
    fontSize: 16,
    color: Theme.colors.primary,
  },
  teamHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  teamHeader_title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
  },
  ctas_random: {
    backgroundColor: Theme.colors.bg,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    marginRight: 8,
  },
  ctas_submit: {
    flexGrow: 1,
  },
})
