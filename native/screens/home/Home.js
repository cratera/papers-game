import React, { useContext, useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

import PapersContext from '@store/PapersContext.js';

import HomeSigned from './HomeSigned.js';
import HomeSignup from './HomeSignup.js';

export default function HomeScreen({ navigation }) {
  const Papers = useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const gameId = game?.id;

  useEffect(() => {
    navigation.navigate(gameId ? 'Room' : 'Home');
  }, [gameId]);

  function handleUpdateProfile(profile) {
    // Do this here to take advatange of hooks!
    Papers.updateProfile(profile);
  }

  return profile.name ? <HomeSigned /> : <HomeSignup onSubmit={handleUpdateProfile} />;
}
