import { Redirect, Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import Bubbling from '@src/components/bubbling'
import Button from '@src/components/button'
import ListPlayers from '@src/components/list-players'
import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import useLeaveGame from '@src/components/settings/useLeaveGame2'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import * as Theme from '@src/theme'

export default function LobbyJoining() {
  const router = useRouter()
  const Papers = usePapersContext()
  const { askToLeaveGame } = useLeaveGame()
  const { game, profile } = Papers.state || {}
  const hasGame = !!game
  const hasTeams = hasGame && !!game.teams
  const profileId = profile?.id || ''
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId
  const playersKeys = hasGame ? Object.keys(game.players) : []
  const neededPlayers = playersKeys.length < 4 // FIX THIS SUPPORT >4
  const wordsAreStored = !!game?.words?.[profileId]
  const canCreateTeam = profileIsAdmin && !neededPlayers && !hasTeams
  const copyAddPlayers = `Add ${4 - playersKeys.length} more friends`

  useEffect(() => {
    if (wordsAreStored) {
      router.push('/room/lobby-writing')
    }
  }, [router, wordsAreStored])

  function goToWritePapers() {
    router.push('/room/write-papers')
  }

  function goToTeamsCreation() {
    router.push('/room/teams')
  }

  if (!game) {
    // TODO:(BUG): This is the weirdest BUG with
    // Let me try to explain this and reproduce later...
    // 1. Create a game on IOS. Let another player join.
    // 2. Open the file utils.js and edit the file (can be anything, ex: confirmLeaveGame)
    // 3. The page will refresh and PapersContext will return empty {}. (if not, repeat step 2.)
    //    But the logs at PapersContext show all the data as expected.
    //
    // Analysis: It seems this component stops receiving new updates from context.
    // Maybe it's a bug with the hot reload (RN or Expo?) It does not happen on browser.
    // I hope this never happens IRL.
    // Update September: This probably is a hotreload bug. never happened in prod, not even once.
    return <Redirect href="/" />
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: true,
          }),
          headerTitle: 'Lobby',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
              Exit
            </Page.HeaderBtn>
          ),
          headerRight: hasTeams ? () => <Page.HeaderBtnSettings /> : undefined,
        }}
      />

      <Bubbling bgStart="bg" bgEnd="yellow" />
      <Page.Main>
        {!game.teams ? (
          <>
            <View style={Styles.header}>
              <Text style={[Styles.header_title, Theme.typography.h1]}>{game.name}</Text>
              <Text style={Theme.typography.secondary} accessibilityLabel={game.code.toString()}>
                {game.code.toString().split('').join('・')}
              </Text>
            </View>

            <ScrollView
              style={[Theme.utils.scrollSideOffset, Styles.list]}
              contentContainerStyle={Theme.spacing.pb_8}
            >
              <ListPlayers players={playersKeys} enableKickout />

              {neededPlayers && !profileIsAdmin ? (
                <Text style={[Theme.typography.secondary, Theme.utils.center, Theme.spacing.mt_16]}>
                  {copyAddPlayers}
                </Text>
              ) : null}
            </ScrollView>
          </>
        ) : (
          <ScrollView style={[Theme.utils.scrollSideOffset, Styles.list]}>
            <ListTeams />
          </ScrollView>
        )}
      </Page.Main>
      <Page.CTAs hasOffset={profileIsAdmin && !neededPlayers}>
        {canCreateTeam ? (
          <Button onPress={goToTeamsCreation}>Create teams</Button>
        ) : neededPlayers && !profileIsAdmin ? (
          <Button disabled>{copyAddPlayers}</Button>
        ) : null}

        {game.teams ? <Button onPress={goToWritePapers}>Write papers</Button> : null}
        {__DEV__ && game.teams && profileIsAdmin && (
          <Button
            variant="danger"
            onPress={Papers.setWordsForEveryone}
            styleTouch={Theme.spacing.mt_16}
          >
            {"💥 Write everyone's papers 💥"}
          </Button>
        )}
      </Page.CTAs>
    </Page>
  )
}

const Styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  header_title: {
    marginTop: 16,
    marginBottom: 16,
  },

  list: {
    paddingTop: 24,
    paddingBottom: 32,
  },
})
