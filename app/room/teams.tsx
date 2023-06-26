import { Redirect, Stack, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useEffectOnce } from 'usehooks-ts'

// import Bubbling from '@src/components/bubbling'
import Button from '@src/components/button'
import ListPlayers from '@src/components/list-players'
import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import { GameTeams, Profile, Round, Team } from '@src/store/PapersContext.types'
import teamNames from '@src/store/teamNames'
import * as Theme from '@src/theme'
import { Color } from '@src/theme/colors'
import { getRandomInt } from '@src/utils/misc'

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

export default function Teams() {
  const Papers = usePapersContext()
  const { game } = Papers.state
  const playersCount = game?.players && Object.keys(game.players).length
  const [tempTeams, setTeams] = useState<GameTeams>()
  const [isLocking, setLocking] = useState(false)
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
  const didMountRef = useRef(false)
  const [isFakingLoading, setIsFakingLoading] = useState(true) // useFakeLoading

  // TODO: later This could be hook useRandomTeams()
  const getRandomTeams: () => GameTeams = useCallback(() => {
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
  }, [game?.players, tempTeams])

  const generateTeams = useCallback(() => {
    setTeams(getRandomTeams())
  }, [getRandomTeams])

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

  useEffect(() => {
    if (didMountRef.current) {
      // When someone just joined/left...
      generateTeams()
    }
  }, [generateTeams, playersCount])

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
      router.push('/room/write-papers')
    } catch (e) {
      const error = e as Error

      setErrorMsg(error.message)
      setLocking(false)
    }
  }

  if (!game) {
    return <Redirect href="/room/gate" />
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
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Teams',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={router.back}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

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
