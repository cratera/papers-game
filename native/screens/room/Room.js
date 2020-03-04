import React, { useContext, useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

import PapersContext from '@store/PapersContext.js';

export default function Room({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile } = Papers.state;
  const { name, id: gameId } = Papers.state.game || {};

  useEffect(() => {
    navigation.navigate(gameId ? 'Room' : 'Home');
  }, [gameId]);

  if (!gameId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <Text>
          {'\n'}
          {'\n'}
          {'\n'}
          You are in the game "{name}", id {gameId}
        </Text>
        {Object.keys(Papers.state.game.players).map(playerId => (
          <Text key={profileId}>{playerId}</Text>
          // REVIEW THIS... it's undefined
        ))}

        <Button title="Go back to Home" onPress={Papers.leaveGame} />
      </ScrollView>
    </View>
  );
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
