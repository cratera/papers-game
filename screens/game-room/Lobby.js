import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Image, View, Text } from 'react-native'
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
  const { profile, profiles, game } = Papers.state
  const profileId = profile.id
  const profileIsAdmin = game.creatorId === profileId
  const gameHasStarted = !!game && game.hasStarted
  const nextPlayer = profiles[game.creatorId]?.name || '???'

  const didSubmitAllWords = React.useCallback(
    plId => {
      return game.words && game.words[plId] && game.words[plId].length === game.settings.words
    },
    [game.words]
  )

  React.useEffect(() => {
    if (gameHasStarted) {
      console.log('Navigate to playing...')
      navigation.navigate('playing')
    }
  }, [gameHasStarted])

  // TODO review all these props
  return !game.teams ? (
    <LobbyJoining
      game={game}
      nextPlayer={nextPlayer}
      onCreateTeams={handleCreateTeams}
      profileIsAdmin={profileIsAdmin}
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
  navigation: PropTypes.shape({
    navigate: PropTypes.func, // (componentName: String)
  }),
}

// ------- LobbyJoining ------- //

const LobbyJoining = ({ game, nextPlayer, onCreateTeams, profileIsAdmin }) => {
  const { players, name, id: gameId } = game
  const hasEnoughPlayers = Object.keys(players).length >= 4

  return (
    <Page>
      <Page.Header />
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
        <Page.Header />
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
