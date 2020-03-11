import React, { Fragment } from 'react';
import { Image, View, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import PapersContext from '@store/PapersContext.js';
import { usePrevious } from '@constants/utils.js';

import WritePapersModal from './WritePapersModal.js';

import * as Theme from '@theme';
// import Styles from './HomeStyles.js';
const Styles = {
  title: () => null,
};

import Page from '@components/page';
import Button from '@components/button';
import ListPlayers from '@components/list-players';
// import TheText from '@components/typography/TheText.js';

export default function Lobby({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const prevHasTeams = usePrevious(!!game.teams);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;
  const hasTeams = !!game.teams;

  const didSubmitAllWords = plId => {
    return game.words && game.words[plId] && game.words[plId].length === game.settings.words;
  };

  React.useEffect(() => {
    if (!prevHasTeams && hasTeams) {
      // Teams were submited, force words!
      !didSubmitAllWords(profileId) && openWords();
    }
  });

  /* REVIEW - Hum... maybe create 2 routes? */
  return !game.teams ? renderLobbyStarting() : renderLobbyWritting();

  function openWords() {
    setModalOpen(true);
  }

  function setWordsForEveyone() {
    // add loading state
    Papers.setWordsForEveyone((res, err) => {
      // remove loading state.
      console.log('setwords done!', err);
    });
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
          <Text>Wait for {profiles[game.creatorId].name} to create the teams.</Text>
        );
      } else {
        return (
          <Text style={Theme.typography.italic}>
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
            <View style={Styles.title(profileIsAdmin)}>
              <Text style={Theme.typography.h1}>{game.name}</Text>
            </View>
          </View>
          <View>
            <Text style={Theme.typography.h3}>Lobby</Text>
            <ListPlayers players={Object.keys(game.players)} enableKickout />
          </View>
        </Page.Main>
        <Page.CTAs>{CTAs()}</Page.CTAs>
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
            <View style={Styles.header}>
              <Text>{game.name}</Text>
              <Text style={Theme.typography.secondary}>
                {!didEveryoneSubmittedTheirWords
                  ? 'Waiting for other players'
                  : 'Everyone finished!'}
              </Text>
              {/* <Image
              style={Styles.headerImg}
              src={`/images/${!didEveryoneSubmittedTheirWords ? 'waiting' : 'done'}.gif`}
              alt=""
            /> */}
            </View>
            <View>
              {Object.keys(game.teams).map(teamId => {
                const { id, name, players } = game.teams[teamId];
                return (
                  <View key={id} style={Styles.team}>
                    <Text style={Theme.typography.h3}>{name}</Text>
                    <Text>Players:</Text>
                    <ListPlayers players={players} />
                  </View>
                );
              })}
            </View>
          </Page.Main>
          <Page.CTAs>
            {!didSubmitWords && <Button onPress={openWords}>Write your papers</Button>}
            {didEveryoneSubmittedTheirWords && profileIsAdmin && (
              <Button onPress={handleStartClick}>Start Game!</Button>
            )}
            {writeAllShortCut && (
              <Button variant="danger" onPress={setWordsForEveyone}>
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
