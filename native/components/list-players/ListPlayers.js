import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import PapersContext from '@store/PapersContext.js';
import Button from '@components/button';
// import Avatar from '@components/avatar';
const Avatar = () => null;
// import * as Styles from './ListPlayersStyles';
const Styles = {};

export default function ListPlayers({ players, enableKickout = false, ...otherProps }) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;

  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;

  function handleKickOut(playerId) {
    const playerName = game.players[playerId].name;
    if (window.confirm(`You are about to kick ${playerName}. Are you sure?`)) {
      Papers.kickoutOfGame(playerId);
    }
  }

  return (
    <View style={Styles.list} {...otherProps}>
      {players.map((playerId, i) => {
        if (!game.players[playerId]) {
          // TODO/UX - What should we do in this case?
          const playerName = profiles[playerId]?.name || playerId;
          return (
            <View key={playerId} style={Styles.item}>
              <View>
                <Avatar hasMargin />
                <Text>
                  - {playerName}
                  <Text>{' (Left) '}</Text>
                </Text>
              </View>
            </View>
          );
        }

        const { avatar, name } = profiles[playerId] || {};
        const { isAfk } = game.players[playerId];
        const wordsSubmitted = game.words && game.words[playerId];
        const writtingStatus = game.teams && (!wordsSubmitted ? 'writting' : 'done');

        return (
          <View
            key={playerId}
            style={[{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }, Styles.item]}
          >
            <View>
              <Avatar src={avatar} hasMargin />
              <Text>
                - {name}
                <Text>
                  {playerId === game.creatorId ? ' (Admin)' : ''}
                  {playerId === profileId ? ' (you)' : ''}
                  {isAfk ? ' ⚠️ ' : ''}
                </Text>
              </Text>
            </View>
            <View>
              {writtingStatus && (
                <Text>[IMG_{writtingStatus}]</Text>
                // <img
                //   style={Styles.itemStatus}
                //   src={`/images/${writtingStatus}.gif`}
                //   alt={`status: ${writtingStatus}`}
                // />
              )}
              {enableKickout && profileIsAdmin && playerId !== profileId && (
                <Button variant="light" size="sm" onPress={() => handleKickOut(playerId)}>
                  Kick out
                </Button>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
