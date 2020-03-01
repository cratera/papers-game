import * as React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

import PapersContext from '@store/PapersContext.js';

import HomeSigned from './HomeSigned.js';
import HomeSignup from './HomeSignup.js';

export default function HomeScreen({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile } = Papers.state;
  const storedGameId = Papers.state.game && Papers.state.game.name;

  if (storedGameId) {
    console.warn('TODO: Redirect to game room');
    // return <Redirect push to={`/game/${storedGameId}`} />;
  }

  function handleUpdateProfile({ name, avatar }) {
    Papers.updateProfile({ name, avatar });
  }

  return Papers.state.profile.name ? <HomeSigned /> : <HomeSignup onSubmit={handleUpdateProfile} />;
}
