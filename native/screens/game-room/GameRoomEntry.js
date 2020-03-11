import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

import PapersContext from '@store/PapersContext.js';

import GameLobby from './Lobby.js';
import GameTeams from './Teams.js';
import GamePlaying from './Playing.js';

import Page from '@components/page';
import Button from '@components/button';
import TheText from '@components/typography/TheText.js';

export default function Room({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const { name, id: gameId } = game || {};

  const urlGameId = null;
  // const { id: urlGameId } = useParams();
  const profileId = profile && profile.id;
  const gameHasStarted = !!game && game.hasStarted;
  const profileIsAfk = game && game.players[profileId]?.isAfk;
  const [status, setStatus] = React.useState(gameId ? 'ready' : 'loading'); // needProfile || ready  || notFound
  // const prevGameId = React.usePrevious(gameId);

  React.useEffect(() => {
    if (!profileId) {
      // REVIEW - do this validation at App.js?
      return setStatus('noProfile');
    }

    if (gameId) {
      return setStatus('ready');
    } else {
      // REVIEW - if just left game, add global status?
      navigation.navigate('home');
    }
  }, [gameId, profileId]);

  React.useEffect(() => {
    if (gameHasStarted) {
      console.log('TODO - Navigating to playing...');
      // navigation.navigate('playing');
    }
  }, [gameHasStarted]);

  const Template = ({ children }) => (
    <Page>
      <Page.Header />
      <Page.Main>{children}</Page.Main>
    </Page>
  );

  if (!profileId || status === 'noProfile') {
    return (
      <Template>
        <Text>To join {gameId || 'a room'} you need to create a profile before!</Text>

        <Button onPress={() => navigation.navigate('home')}>Create profile</Button>
      </Template>
    );
  }

  if (status === 'loading') {
    return (
      <Template>
        <Text>
          Joining "{profile.gameId}"...
          {'\n'}
          {'\n'}
        </Text>
        {/* <Button onPress={() => navigation.navigate('home')}>Taking too long? Go Home</Button> */}
      </Template>
    );
  }

  /* REVIEW TODO - HANDLE THESE 2 CASES */

  // if (status === 'notFound') {
  //   return (
  //     <Template>
  //       <Text>Ups, the game "{urlGameId}" doesn't seem to exist!</Text>
  //       <Button onPress={() => navigation.navigate('home')}>Go Home</Button>
  //     </Template>
  //   );
  // }

  if (status === 'ups' || !gameId) {
    return (
      <Template>
        <Text>Ups, something went wrong while loading {gameId}.</Text>
        <Button onPress={() => navigation.navigate('home')}>Go Home</Button>
      </Template>
    );
  }

  // const gamePath = `/game/${gameId}`;

  //       {!game.hasStarted ? <GameLobby /> : <Redirect to={`${gamePath}/playing`} />}

  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="lobby" component={GameLobby} />
      <Stack.Screen name="playing" component={GamePlaying} />
      {!game.teams ? <Stack.Screen name="teams" component={GameTeams} /> : null}
    </Stack.Navigator>
  );

  // return (
  //   <Switch>
  //     <Route exact path="/game/:id">
  //       <Redirect to={`${gamePath}/lobby`} />
  //     </Route>
  //     <Route path="/game/:id/lobby">
  //       {!game.hasStarted ? <GameLobby /> : <Redirect to={`${gamePath}/playing`} />}
  //     </Route>
  //     <Route path="/game/:id/teams">
  //       {!game.teams ? <GameTeams /> : <Redirect to={`${gamePath}/lobby`} />}
  //     </Route>

  //     <Route path="/game/:id/playing">
  //       {game.hasStarted ? <GamePlaying /> : <Redirect to={`${gamePath}/lobby`} />}
  //     </Route>
  //     {/* <Route path="/game/:id/words">
  //       <GameWords />
  //     </Route> */}
  //     <Route path="*">
  //       <Redirect to={`${gamePath}/lobby`} />
  //     </Route>
  //   </Switch>
  // );
}

Room.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
