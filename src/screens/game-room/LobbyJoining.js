import PropTypes from 'prop-types'
import React from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { analytics as Analytics } from '@src/services/firebase'

import PapersContext from '@src/store/PapersContext.js'

import * as Theme from '@src/theme'
import Styles from './LobbyStyles.js'

import Bubbling from '@src/components/bubbling'
import Button from '@src/components/button'
import ListPlayers from '@src/components/list-players'
import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import { useLeaveGame } from '@src/components/settings'

export default function LobbyJoining({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame({ navigation })
  const { game, profile } = Papers.state || {}
  const hasGame = !!game
  const hasTeams = hasGame && !!game.teams
  const profileId = profile && profile.id
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId
  const playersKeys = hasGame ? Object.keys(game.players) : []
  const neededPlayers = playersKeys.length < 4 // FIX THIS SUPPORT >4
  const wordsAreStored = !!game?.words?.[profileId]
  const canCreateTeam = profileIsAdmin && !neededPlayers && !hasTeams
  const copyAddPlayers = `Add ${4 - playersKeys.length} more friends`

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
            Exit
          </Page.HeaderBtn>
        )
      },
    })
    Analytics.setCurrentScreen('game_lobby_joining')
  }, [])

  React.useEffect(() => {
    if (canCreateTeam) {
      navigation.setOptions({
        // headerRight: function HLB() {
        //   return (
        //     <Page.HeaderBtn
        //       side="right"
        //       icon="next"
        //       textPrimary
        //       onPress={() => navigation.navigate('teams')}
        //     >
        //       Teams
        //     </Page.HeaderBtn>
        //   )
        // },
      })
    } else if (hasTeams) {
      navigation.setOptions({
        headerRight: function HLB() {
          return <Page.HeaderBtnSettings />
        },
      })
    } else {
      navigation.setOptions({
        headerRight: null,
      })
    }
  }, [hasTeams, canCreateTeam])

  React.useEffect(() => {
    if (hasTeams) {
      navigation.setOptions({
        headerTitle: 'Teams',
      })
    }
  }, [hasTeams])

  React.useEffect(() => {
    if (wordsAreStored) {
      navigation.navigate('lobby-writing')
    }
  }, [wordsAreStored])

  function goToWritePapers() {
    navigation.navigate('write-papers')
  }

  function goToTeamsCreation() {
    navigation.navigate('teams')
  }

  if (!game) {
    // TODO:(BUG): This is the weirdest BUG with React.
    // Let me try to explain this and reproduce later...
    // 1. Create a game on IOS. Let another player join.
    // 2. Open the file utils.js and edit the file (can be anything, ex: confirmLeaveGame)
    // 3. The page will refresh and PapersContext will return empty {}. (if not, repeat step 2.)
    //    But the logs at PapersContext.js show all the data as expected.
    //
    // Analysis: It seems this component stops receiving new updates from context.
    // Maybe it's a bug with the hot reload (RN or Expo?) It does not happen on browser.
    // I hope this never happens IRL.
    // Update September: This probably is a hotreload bug. never happened in prod, not even once.
    return null
  }

  return (
    <Page>
      <Bubbling bgStart={Theme.colors.bg} bgEnd={Theme.colors.yellow} />
      <Page.Main headerDivider>
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
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <ListPlayers players={playersKeys} enableKickout />

              {neededPlayers && !profileIsAdmin ? (
                <Text style={[Theme.typography.secondary, Theme.utils.center, { marginTop: 16 }]}>
                  {copyAddPlayers}
                </Text>
              ) : null}
            </ScrollView>
          </>
        ) : (
          <ScrollView style={[Theme.utils.scrollSideOffset, Styles.list]}>
            <ListTeams enableNameEdition />
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
            onPress={Papers.setWordsForEveyone}
            styleTouch={{ marginTop: 16 }}
          >
            {"💥 Write everyone's papers 💥"}
          </Button>
        )}
      </Page.CTAs>
    </Page>
  )
}

LobbyJoining.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
