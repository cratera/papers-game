/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useContext } from 'react';

import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button';
import Avatar from 'components/Avatar';
import * as Styles from './ListPlayersStyles';

function ListPlayers({ players, enableKickout = false, ...otherProps }) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;

  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;

  function handleKickOut(playerId) {
    const playerName = game.players[playerId].name;
    if (window.confirm(`You are about to kick ${playerName}. Are you sure?`)) {
      Papers.kickoutOfGame(playerId);
    }
  }

  return (
    <ul css={Styles.list} {...otherProps}>
      {players.map((playerId, i) => {
        if (!game.players[playerId]) {
          // TODO/UX - What should we do in this case?
          const playerName = playerId.match('_(.*)_')[1];
          return (
            <li key={playerId} css={Styles.item}>
              <span>
                <Avatar hasMargin />
                <span> {playerName} </span>
                &nbsp;
                <span>{' (Left) '}</span>
              </span>
            </li>
          );
        }

        const { avatar, name, id, isAfk } = game.players[playerId];
        const isAdmin = id === game.creatorId;
        const wordsSubmitted = game.words[id];
        const writtingStatus = game.teams && (!wordsSubmitted ? 'writting' : 'done');

        return (
          <li key={id} css={Styles.item}>
            <span>
              <Avatar src={avatar} hasMargin />
              <span>{name}</span>
              <span>
                &nbsp;
                {isAdmin ? ' (Admin) ' : id === profileId && ' (you) '}
                {isAfk && ' ⚠️ '}
              </span>
            </span>
            <span>
              {writtingStatus && (
                <img
                  css={Styles.itemStatus}
                  src={`/images/${writtingStatus}.gif`}
                  alt={`status: ${writtingStatus}`}
                />
              )}
              {enableKickout && profileIsAdmin && id !== profileId && (
                <Button variant="light" size="sm" onClick={() => handleKickOut(id)}>
                  Kick out
                </Button>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default ListPlayers;
