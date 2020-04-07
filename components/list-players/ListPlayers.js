import React from 'react';
import { View, Text, Image, Platform } from 'react-native';

import imgWritting from '@assets/images/writting.gif';
import imgDone from '@assets/images/done.gif';

import PapersContext from '@store/PapersContext.js';
import Button from '@components/button';
import Avatar from '@components/avatar';

import Styles from './ListPlayersStyles';
import * as Theme from '@theme';

const imgMap = {
  writting: {
    src: imgWritting,
    alt: 'Stil writting papers',
  },
  done: {
    src: imgDone,
    alt: 'All papers done',
  },
};

export default function ListPlayers({ players, enableKickout = false, ...otherProps }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;
  const [isKicking, setIsKicking] = React.useState(null); // playerId

  async function handleKickOut(playerId) {
    const playerName = profiles[playerId].name;
    if (
      Platform.OS !== 'web' ||
      window.confirm(`You are about to kick "${playerName}". Are you sure?`)
    ) {
      setIsKicking(playerId);
      await Papers.removePlayer(playerId);
      setIsKicking(null);
    }
  }

  return (
    <View style={Styles.list} {...otherProps}>
      {players.map((playerId, i) => {
        const isLastChild = i === players.length;
        if (!game.players[playerId]) {
          // TODO/UX - What should we do in this case?
          const playerName = profiles[playerId]?.name || playerId;
          return (
            <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
              <View style={Styles.who}>
                <Avatar hasMargin />
                <View>
                  <Text style={Theme.typography.body}>{playerName}</Text>
                  <Text style={Theme.typography.seconday}>{' (Left) '}</Text>
                </View>
              </View>
            </View>
          );
        }

        const { avatar, name } = profiles[playerId] || {};
        const { isAfk } = game.players[playerId];
        const wordsSubmitted = game.words && game.words[playerId];
        const status = game.teams && (!wordsSubmitted ? 'writting' : 'done');
        const imgInfo = status && imgMap[status];
        return (
          <View key={playerId} style={[Styles.item, isLastChild && Styles.item_isLast]}>
            <View style={Styles.who}>
              <Avatar src={avatar} hasMargin />
              <View>
                <Text style={Theme.typography.body}>{name}</Text>
                <Text style={Theme.typography.small}>
                  {playerId === game.creatorId ? '(Admin) ' : ''}
                  {playerId === profileId ? '(you) ' : ''}
                  {isAfk ? '(⚠️) ' : ''}
                </Text>
              </View>
            </View>
            <View style={Styles.ctas}>
              {enableKickout && profileIsAdmin && playerId !== profileId && (
                <Button
                  variant="light"
                  size="sm"
                  isLoading={isKicking === playerId}
                  onPress={() => handleKickOut(playerId)}
                >
                  Kick out
                </Button>
              )}
              {imgInfo && (
                <Image
                  style={[Styles.itemStatus, Styles[`itemStatus_${status}`]]}
                  source={imgInfo.src}
                  accessibilityLabel={imgInfo.alt}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
