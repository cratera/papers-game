import React, { useContext, useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

import PapersContext from '@store/PapersContext.js';

export default function Room({ navigation }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const { name, id: gameId } = game || {};

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
          Game Name: {name}
          {'\n'}
          Game id: {gameId}
          {'\n'}
        </Text>
        <Text>Players:</Text>
        {Object.keys(Papers.state.game.players).map(playerId => (
          <Text key={playerId}>- {(profiles && profiles[playerId]?.name) || playerId}</Text>
        ))}

        <Button title="Leave Game" onPress={Papers.leaveGame} />
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
