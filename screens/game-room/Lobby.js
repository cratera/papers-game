import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Alert, Platform, Image, View, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'
import { usePrevious } from '@constants/utils.js'

import imgWaiting from '@assets/images/waiting.gif'
import imgDone from '@assets/images/done.gif'

import WritePapersModal from './WritePapersModal.js'

import * as Theme from '@theme'
import Styles from './LobbyStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import ListPlayers from '@components/list-players'

export default function Lobby({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state || {}
  const profileId = profile && profile.id
  const creatorId = !!game && game.creatorId
  const gameWords = !!game && game.words
  const profileIsAdmin = creatorId === profileId
  const gameHasStarted = !!game && game.hasStarted
  const nextPlayer = (profiles && profiles[creatorId]?.name) || '???'
  const didSubmitAllWords = React.useCallback(
    plId => {
      return (
        game && game.words && game.words[plId] && game.words[plId].length === game.settings.words
      )
    },
    [gameWords]
  )

  React.useEffect(() => {
    if (gameHasStarted) {
      console.log('Navigate to playing...')
      navigation.navigate('playing')
    }
  }, [gameHasStarted])

  if (!game) {
    console.warn('What went wrong with useContext and PapersContext??', Papers)
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

  // TODO review all these props
  return !game.teams ? (
    <LobbyJoining
      game={game}
      nextPlayer={nextPlayer}
      onCreateTeams={handleCreateTeams}
      profileIsAdmin={profileIsAdmin}
      leaveGame={Papers.leaveGame}
      navigation={navigation}
    />
  ) : (
    <LobbyWritting
      game={game}
      nextPlayer={nextPlayer}
      didSubmitAllWords={didSubmitAllWords}
      profileIsAdmin={profileIsAdmin}
      profileId={profileId}
      profiles={profiles}
      handleStartClick={handleStartClick}
      setWordsForEveyone={setWordsForEveyone}
      navigation={navigation}
    />
  )

  async function setWordsForEveyone() {
    try {
      await Papers.setWordsForEveyone()
      console.log('setwords done!')
    } catch (error) {
      console.error('setWordsForEveyone failed!', error)
    }
  }

  function handleStartClick() {
    Papers.startGame()
  }

  function handleCreateTeams() {
    navigation.navigate('teams')
  }
}

Lobby.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
}

// ------- LobbyJoining ------- //

const LobbyJoining = ({
  game,
  nextPlayer,
  onCreateTeams,
  profileIsAdmin,
  leaveGame,
  navigation,
}) => {
  const { players, name, id: gameId } = game
  const hasEnoughPlayers = Object.keys(players).length >= 4

  // React.useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: 'Lobby',
  //     headerLeft: null,
  //     headerRight: null,
  //     // headerTintColor: '#fff', // TODO this
  //     // headerStyle: {
  //     //   shadowColor: 'transparent',
  //     //   borderBottomWidth: 0,
  //     // },
  //   })
  // }, [])

  // React.useEffect(() => {
  //   if (hasEnoughPlayers && profileIsAdmin) {
  //     navigation.setOptions({
  //       headerTitle: 'Lobby',
  //       headerRight: function x() {
  //         return (
  //           <Page.HeaderBtn side="right" onPress={onCreateTeams}>
  //             Create teams
  //           </Page.HeaderBtn>
  //         )
  //       },
  //     })
  //   }
  // }, [hasEnoughPlayers, profileIsAdmin])

  // TODO dry this. Here and settings. Maybe a fn component without styles?
  function handleCancelPress() {
    const fnToLeave = leaveGame

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave the game?')) {
        fnToLeave()
      }
    } else {
      Alert.alert(
        'Are you sure?',
        'Your game will be deleted',
        [
          {
            text: 'Leave Game',
            onPress: fnToLeave,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Leave Game cancelled'),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <Page>
      {/* <Page.Header /> */}
      <Page.Main>
        <View style={Styles.header}>
          {profileIsAdmin && (
            <Text style={[Theme.typography.small, Styles.cap]}>Ask your friends to join!</Text>
          )}
          <View style={Styles.title}>
            <Text style={[Theme.u.center, Theme.typography.h1]}>{name}</Text>
            {name.toLowerCase() !== gameId && (
              <Text style={[Theme.u.center, Theme.typography.body]}>
                Join id: <Text style={Theme.typography.h3}>{gameId}</Text>
              </Text>
            )}
            {/* TODO Later - Share game. */}
          </View>
        </View>
        <ScrollView style={[Theme.u.scrollSideOffset, Styles.list]}>
          <Text style={Theme.typography.h3}>Lobby</Text>
          <ListPlayers players={Object.keys(players)} enableKickout />
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset={profileIsAdmin && hasEnoughPlayers}>
        <LobbyJoiningCTAs
          hasEnoughPlayers={hasEnoughPlayers}
          profileIsAdmin={profileIsAdmin}
          onCreateTeams={onCreateTeams}
          nextPlayer={nextPlayer}
        />
      </Page.CTAs>
    </Page>
  )
}

LobbyJoining.propTypes = {
  game: PropTypes.object.isRequired, // TODO shape this
  profileIsAdmin: PropTypes.bool.isRequired,
  onCreateTeams: PropTypes.func.isRequired,
  nextPlayer: PropTypes.string.isRequired,
  navigation: PropTypes.object, // ReactNavigation,
}

const LobbyJoiningCTAsToMemo = ({
  hasEnoughPlayers,
  profileIsAdmin,
  onCreateTeams,
  nextPlayer,
}) => {
  if (hasEnoughPlayers) {
    return profileIsAdmin ? (
      <Button onPress={onCreateTeams}>Create teams!</Button>
    ) : (
      <Text style={[Theme.typography.small, Styles.status]}>
        Wait for {nextPlayer} to create the teams.
      </Text>
    )
  }

  return (
    <Text style={[Theme.typography.small, Styles.status]}>
      Waiting for your friends to join the game (minimum 4).
    </Text>
  )
}

const LobbyJoiningCTAs = React.memo(LobbyJoiningCTAsToMemo)

LobbyJoiningCTAsToMemo.propTypes = {
  hasEnoughPlayers: PropTypes.bool.isRequired,
  profileIsAdmin: PropTypes.bool.isRequired,
  onCreateTeams: PropTypes.func.isRequired,
  nextPlayer: PropTypes.string.isRequired,
}

// ------- LobbyWritting ------- //

const LobbyWritting = ({
  game,
  didSubmitAllWords,
  profileIsAdmin,
  profileId,
  profiles,
  handleStartClick,
  setWordsForEveyone,
  nextPlayer,
}) => {
  const [isModalOpen, setModalOpen] = React.useState(false)
  const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords)
  const didSubmitWords = didSubmitAllWords(profileId)
  const writeAllShortCut = profileIsAdmin && !didEveryoneSubmittedTheirWords
  const prevHasTeams = usePrevious(!!game.teams)
  const hasTeams = !!game.teams

  React.useEffect(() => {
    if (!prevHasTeams && hasTeams) {
      // Teams were submited, force words!
      !didSubmitAllWords(profileId) && openWords()
    }
  }, [prevHasTeams, hasTeams, didSubmitAllWords])

  function openWords() {
    setModalOpen(true)
  }

  return (
    <Fragment>
      <Page>
        <Page.Main>
          <ScrollView style={Theme.u.scrollSideOffset}>
            <View style={Styles.header}>
              {!didEveryoneSubmittedTheirWords && (
                <Text style={Theme.typography.h1}>{game.name}</Text>
              )}
              <Text style={Theme.typography.secondary}>
                {!didEveryoneSubmittedTheirWords
                  ? 'Waiting for other players'
                  : 'Everyone finished!'}
              </Text>
              <Image
                style={[
                  Styles.header_img,
                  didEveryoneSubmittedTheirWords && Styles.header_img_done,
                ]}
                source={didEveryoneSubmittedTheirWords ? imgDone : imgWaiting}
                accessibilityLabel=""
              />
            </View>
            <View>
              {Object.keys(game.teams).map(teamId => {
                const { id, name, players } = game.teams[teamId]
                return (
                  <View key={id} style={Styles.team}>
                    <Text style={Theme.typography.h3}>{name}</Text>
                    <ListPlayers players={players} enableKickout />
                  </View>
                )
              })}
            </View>
          </ScrollView>
        </Page.Main>
        <Page.CTAs hasOffset={!(didSubmitWords && !profileIsAdmin)}>
          {!didSubmitWords && <Button onPress={openWords}>Write your papers</Button>}
          {didSubmitWords && !profileIsAdmin && (
            <Text style={[Theme.typography.small, Styles.status]}>
              {didEveryoneSubmittedTheirWords
                ? `Waiting for ${nextPlayer} to start the game.`
                : 'Waiting for everyone to be ready!'}
            </Text>
          )}
          {didEveryoneSubmittedTheirWords && profileIsAdmin && (
            <Button onPress={handleStartClick}>Start Game!</Button>
          )}
          {writeAllShortCut && (
            <Button variant="danger" onPress={setWordsForEveyone} styleTouch={{ marginTop: 16 }}>
              {/* eslint-disable-next-line */}
              Write everyone's papers 💥
            </Button>
          )}
        </Page.CTAs>
      </Page>
      <WritePapersModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </Fragment>
  )
}

LobbyWritting.propTypes = {
  game: PropTypes.object.isRequired,
  didSubmitAllWords: PropTypes.func.isRequired,
  profileIsAdmin: PropTypes.bool.isRequired,
  profileId: PropTypes.string.isRequired,
  profiles: PropTypes.object.isRequired, // TODO especify this
  handleStartClick: PropTypes.func.isRequired,
  setWordsForEveyone: PropTypes.func.isRequired,
  nextPlayer: PropTypes.string.isRequired,
}
