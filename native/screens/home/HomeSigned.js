import * as React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

export default function HomeSigned({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <Text>I am HomeSigned!</Text>

        <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      </ScrollView>
    </View>
  );
}

HomeSigned.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
