import * as React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <Text>I am Home!</Text>

        <Button title="Go to Room" onPress={() => navigation.navigate('Room')} />
      </ScrollView>
    </View>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
