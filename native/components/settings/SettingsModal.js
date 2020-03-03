import React, { useState, useCallback, useContext } from 'react';

import * as Theme from '@theme';
import { StyleSheet, RefreshControl, ScrollView, View, Text } from 'react-native';

import PapersContext from '@store/PapersContext.js';

import Button from '@components/button';
import TheText from '@components/typography/TheText.js';
import Modal from '@components/modal';

function Item({ title, btn, onPress, description }) {
  return (
    <View style={Styles.group}>
      <View style={Styles.info}>
        <Text style={Theme.typography.h3}>{title}</Text>
        {btn && (
          <Button size="sm" onPress={onPress}>
            {btn}
          </Button>
        )}
      </View>
      <Text style={[Theme.typography.secondary, Theme.typography.small]}>{description}</Text>
    </View>
  );
}

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default function SettingsModal({ isOpen, onClose }) {
  const Papers = useContext(PapersContext);
  const { game } = Papers.state;
  const gameId = game && game.name;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    console.log('Do something to refresh!');
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);

  const handleLeaveGame = () => {
    console.warn('TODO R U SURE - LEAVE');
    // if (window.confirm('Are you sure you wanna leave the game?')) {
    //   Papers.leaveGame();
    // }
  };

  const handleResetProfile = () => {
    Papers.resetProfile();
  };

  return (
    <Modal visible={isOpen} onClose={onClose}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={Theme.typography.h2} accessibilityRole="header">
          Game Settings
        </Text>
        <Text>{'\n'}</Text>
        {gameId ? (
          <Item
            title="🔌 Leave Game"
            btn="Leave Game"
            onPress={handleLeaveGame}
            description=" You'll leave the group. If the game starts meanwhile, you won't be able to join again."
          />
        ) : (
          <TheText style={Theme.typography.secondary}>No game on going. Come back later.</TheText>
        )}

        <Text>{'\n'}</Text>

        <Text style={Theme.typography.h2}>App Settings</Text>
        <Text>{'\n'}</Text>
        <Item
          title="♻️ Refresh Game"
          description="Something wrong? Pull down to refresh the game!"
        />
        <Text>{'\n'}</Text>
        <Item
          title="✨ Reset Profile"
          btn="Reset Profile"
          onPress={handleResetProfile}
          description="This will delete your local profile and you'll have a fresh start. If you are in the
            middle of a game, you'll leave the game too."
        />
      </ScrollView>
    </Modal>
  );
}

const Styles = StyleSheet.create({
  content: {
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  close: {
    position: 'absolute',
    top: 32,
    right: 8,
    zIndex: 21,
  },
  group: {},
  info: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
