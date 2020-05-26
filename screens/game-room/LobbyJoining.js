import React from 'react'
import PropTypes from 'prop-types'
import { View, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'
import Styles from './LobbyStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import ListPlayers from '@components/list-players'
import ListTeams from '@components/list-teams'
import { useLeaveGame } from '@components/settings'

export default function LobbyJoining({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame()
  const { game, profile } = Papers.state || {}
  const hasGame = !!game
  const hasTeams = hasGame && !!game.teams
  const profileId = profile && profile.id
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId
  const playersKeys = hasGame ? Object.keys(game.players) : []
  const hasEnoughPlayers = playersKeys.length >= 4
  const wordsAreStored = !!game.words && !!game.words[profileId]

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'New game',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
            Exit
          </Page.HeaderBtn>
        )
      },
      headerRight: null,
      headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
      },
    })
  }, [])

  React.useEffect(() => {
    if (profileIsAdmin && hasEnoughPlayers && !hasTeams) {
      navigation.setOptions({
        headerRight: function HLB() {
          return (
            <Page.HeaderBtn side="right" onPress={() => navigation.navigate('teams')}>
              Teams 👉
            </Page.HeaderBtn>
          )
        },
      })
    } else {
      navigation.setOptions({
        headerRight: null,
      })
    }
  }, [profileIsAdmin, hasEnoughPlayers, hasTeams])

  React.useEffect(() => {
    if (wordsAreStored) {
      navigation.navigate('lobby-writing')
    }
  }, [wordsAreStored])

  if (!game) {
    console.warn('Lobby: Hot reload bug happened!', Papers)
    // TODO/BUG: This is the weirdest BUG with React.
    // Let me try to explain this and reproduce later...
    // 1. Create a team a game on IOS. Let another player join.
    // 2. Open the file utils.js and edit the file (can be anything, ex: confirmLeaveGame)
    // 3. The page will refresh and PapersContext will return empty {}. (if not, repeat step 2.)
    //    But the logs at PapersContext.js show all the data as expected.
    //
    // Analysis: It seems this component stops receiving new updates from context.
    // Maybe it's a bug with the hot reload (RN or Expo?) It does not happen on browser.
    // I hope this never happens IRL.

    // TODO report error to server.
    return (
      <View>
        <Text>Ups! Game does not exist...</Text>
        <Button onPress={() => navigation.navigate('home')}>Go Home</Button>
      </View>
    )
  }

  return (
    <Page>
      <Page.Main>
        {!game.teams ? (
          <>
            <View style={Styles.header}>
              {profileIsAdmin && (
                <Text style={[Theme.typography.small, Styles.cap]}>Ask your friends to join!</Text>
              )}
              <View style={Styles.title}>
                <Text style={[Theme.u.center, Theme.typography.h1]}>{game.name}</Text>
                {game.name.toLowerCase() !== game.id && (
                  <Text style={[Theme.u.center, Theme.typography.body]}>
                    Join id: <Text style={Theme.typography.h3}>{game.id}</Text>
                  </Text>
                )}
                <Text style={[Theme.typography.secondary]}>[TODO: Access code]</Text>
                {/* TODO Later - Share game. */}
              </View>
            </View>

            <ScrollView style={[Theme.u.scrollSideOffset, Styles.list]}>
              <Text style={Theme.typography.h3}>Lobby</Text>
              {!hasEnoughPlayers && (
                <Text style={[Theme.typography.small, { marginTop: 4 }]}>
                  Waiting for your friends to join (4 minimum)
                </Text>
              )}
              <ListPlayers players={playersKeys} enableKickout />
            </ScrollView>
          </>
        ) : (
          <ScrollView style={[Theme.u.scrollSideOffset, Styles.list]}>
            <ListTeams enableNameEdition />
          </ScrollView>
        )}
      </Page.Main>
      <Page.CTAs hasOffset={profileIsAdmin && hasEnoughPlayers}>
        {game.teams && <Button onPress={goToWritePapers}>Write papers</Button>}
        {game.teams && profileIsAdmin && (
          <Button variant="danger" onPress={setWordsForEveyone} styleTouch={{ marginTop: 16 }}>
            {/* eslint-disable-next-line */}
            💥 Write everyone's papers 💥
          </Button>
        )}
      </Page.CTAs>
    </Page>
  )

  function goToWritePapers() {
    navigation.navigate('write-papers')
  }

  async function setWordsForEveyone() {
    try {
      await Papers.setWordsForEveyone()
      console.log('setwords done!')
    } catch (error) {
      console.error('setWordsForEveyone failed!', error)
    }
  }
}

LobbyJoining.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
}
