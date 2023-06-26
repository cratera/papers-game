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

import { StackScreenProps } from '@react-navigation/stack'
import { headerTheme } from '@src/navigation/headerStuff'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { GameTeams, Profile, Round, Team } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'
import { Color } from '@src/theme/colors'
import { useEffectOnce } from 'usehooks-ts'

function areTeamPlayersEqual(teamsOld: GameTeams, teamsNew: GameTeams) {
  const tOld: Record<Round['turnWho']['team'], Team['players']> = {
    0: [],
    1: [],
  }
  const tNew: Record<Round['turnWho']['team'], Team['players']> = {
    0: [],
    1: [],
  }

  for (const team in teamsNew) {
    const teamId = Number(team) as keyof GameTeams

    tNew[teamId] = teamsNew[teamId].players
  }
  for (const team in teamsOld) {
    const teamId = Number(team) as keyof GameTeams

    tOld[teamId] = teamsOld[teamId].players
  }

  const result = JSON.stringify(tOld) === JSON.stringify(tNew)
  return result
}

const bgStart: Color = 'bg' // yellow
const bgEnd: Color = 'bg' // pink

export default function Teams({ navigation }: StackScreenProps<AppStackParamList, 'teams'>) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  // const playersCount = game?.players && Object.keys(game.players).length
  const [tempTeams, setTeams] = React.useState<GameTeams>()
  const [isLocking, setLocking] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | undefined>(undefined)
  const didMountRef = React.useRef(false)
  const [isFakingLoading, setIsFakingLoading] = React.useState(true) // useFakeLoading

  useEffectOnce(() => {
    didMountRef.current = true

    const timeout = setTimeout(() => {
      setIsFakingLoading(false)
    }, 1500)

    return () => {
      clearTimeout(timeout)
      didMountRef.current = false
    }
  })

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme(),
      title: 'Teams',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={() => navigation.goBack()}>
            Back
          </Page.HeaderBtn>
        )
      },
      headerRight: undefined,
    })
    Analytics.setCurrentScreen('game_teams_creation')
  }, [navigation])

  // TODO: later This could be hook useRandomTeams()
  const getRandomTeams: () => GameTeams = () => {
    const players = (game?.players && Object.keys(game.players)) || []
    const teamsNr = 2 // LATER - Game Setting
    const teams = Array.from(Array(teamsNr), () => [] as string[])
    const limit = Math.round((players?.length || 0) / teamsNr)
    const newTempTeams = {} as GameTeams

    function alocateTo(teamIndex: number, playerId: Profile['id']) {
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
      const teamId = index as keyof GameTeams

      newTempTeams[teamId] = {
        id: teamId,
        name: teamNames[getRandomInt(teamNames.length - 1)],
        players: team,
      }

      if (index === 1 && newTempTeams[1].name === newTempTeams[0].name) {
        if (__DEV__) console.log('Teams with same name. Get new one.')
        newTempTeams[1].name = teamNames[getRandomInt(teamNames.length - 1)]
      }
    })

    if (tempTeams && areTeamPlayersEqual(tempTeams, newTempTeams)) {
      if (__DEV__) console.log('Equal teams. Randomize again.')
      return getRandomTeams()
    } else {
      return newTempTeams
    }
  }

  const generateTeams = () => {
    setTeams(getRandomTeams())
  }

  useEffectOnce(() => {
    if (didMountRef.current) {
      // When someone just joined/left...
      generateTeams()
    }
  })

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
    setErrorMsg(undefined)
    setLocking(true)

    try {
      if (tempTeams) {
        await Papers.setTeams(tempTeams)
      }
      navigation.setOptions({ headerRight: undefined })
      navigation.navigate('write-papers')
    } catch (e) {
      const error = e as Error

      setErrorMsg(error.message)
      setLocking(false)
    }
  }

  if (isFakingLoading) {
    return (
      <Page bannerMsg={errorMsg} bgFill={bgStart}>
        <Page.Main>
          <LoadingBadge variant="page">Creating teams</LoadingBadge>
        </Page.Main>
      </Page>
    )
  }

  return (
    <Page bannerMsg={errorMsg} bgFill={bgEnd}>
      {/* <Bubbling bgStart={bgStart} bgEnd={bgEnd} /> */}
      <Page.Main>
        <ScrollView
          style={Theme.utils.scrollSideOffset}
          contentContainerStyle={Theme.spacing.pb_16}
        >
          {tempTeams &&
            Object.keys(tempTeams).map((team) => {
              const teamId = Number(team) as keyof GameTeams

              const { id, name, players } = tempTeams[teamId]

              return (
                <View key={id}>
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
          <View style={Theme.utils.ctaSafeArea} />
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset style={Styles.ctas}>
        <Button
          variant="icon"
          size="lg"
          style={Styles.ctas_random}
          accessibilityLabel="Randomize teams"
          onPress={generateTeams}
          styleTouch={Theme.spacing.mb_16}
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

const Styles = StyleSheet.create({
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
