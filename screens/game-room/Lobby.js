import React, { Fragment } from 'react';
import { Image, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import PapersContext from '@store/PapersContext.js';
import { usePrevious } from '@constants/utils.js';

import imgWaiting from '@assets/images/waiting.gif';
import imgDone from '@assets/images/done.gif';

import WritePapersModal from './WritePapersModal.js';

import * as Theme from '@theme';
import Styles from './LobbyStyles.js';

import Page from '@components/page';
import Button from '@components/button';
import ListPlayers from '@components/list-players';

export default function Lobby({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const prevHasTeams = usePrevious(!!game.teams);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;
  const hasTeams = !!game.teams;
  const gameHasStarted = !!game && game.hasStarted;

  const didSubmitAllWords = plId => {
    return game.words && game.words[plId] && game.words[plId].length === game.settings.words;
  };

  React.useEffect(() => {
    if (!prevHasTeams && hasTeams) {
      // Teams were submited, force words!
      !didSubmitAllWords(profileId) && openWords();
    }
  });

  React.useEffect(() => {
    if (gameHasStarted) {
      console.log('Navigating to playing...');
      navigation.navigate('playing');
    }
  }, [gameHasStarted]);

  /* REVIEW - Hum... maybe create 2 routes? */
  return !game.teams ? renderLobbyStarting() : renderLobbyWritting();

  function openWords() {
    setModalOpen(true);
  }

  async function setWordsForEveyone() {
    try {
      await Papers.setWordsForEveyone();
      console.log('setwords done!');
    } catch (error) {
      console.error('setWordsForEveyone failed!', error);
    }
  }

  function handleStartClick() {
    Papers.startGame();
  }

  function handleCreateTeams() {
    navigation.navigate('teams');
  }

  function renderLobbyStarting() {
    function CTAs() {
      if (Object.keys(game.players).length >= 4) {
        return profileIsAdmin ? (
          <Button onPress={handleCreateTeams}>Create teams!</Button>
        ) : (
          <Text style={[Theme.typography.small, Styles.status]}>
            Wait for {profiles[game.creatorId]?.name || '???'} to create the teams.
          </Text>
        );
      } else {
        return (
          <Text style={[Theme.typography.small, Styles.status]}>
            Waiting for your friends to join the game (Minimum 4).
          </Text>
        );
      }
    }

    return (
      <Page>
        <Page.Header />
        <Page.Main>
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
              {/* Later - ShAre game. */}
            </View>
          </View>
          <ScrollView style={[Theme.u.scrollSideOffset, Styles.list]}>
            <Text style={Theme.typography.h3}>Lobby</Text>
            <ListPlayers players={Object.keys(game.players)} enableKickout />
          </ScrollView>
        </Page.Main>
        <Page.CTAs hasOffset={profileIsAdmin}>{CTAs()}</Page.CTAs>
      </Page>
    );
  }

  function renderLobbyWritting() {
    const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords);
    const didSubmitWords = didSubmitAllWords(profileId);
    const writeAllShortCut = profileIsAdmin && !didEveryoneSubmittedTheirWords;

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
                  const { id, name, players } = game.teams[teamId];
                  return (
                    <View key={id} style={Styles.team}>
                      <Text style={Theme.typography.h3}>{name}</Text>
                      <ListPlayers players={players} enableKickout />
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Page.Main>
          <Page.CTAs hasOffset={!(didSubmitWords && !profileIsAdmin)}>
            {!didSubmitWords && <Button onPress={openWords}>Write your papers</Button>}
            {didSubmitWords && !profileIsAdmin && (
              <Text style={[Theme.typography.small, Styles.status]}>
                {didEveryoneSubmittedTheirWords
                  ? `Waiting for ${profiles[game.creatorId]?.name || '???'} to start the game.`
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
    );
  }
}
