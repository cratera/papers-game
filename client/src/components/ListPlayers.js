/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext } from 'react';

import * as Styles from '../views/GameRoomStyles.js';
import Button from 'components/Button.js';
import PapersContext from 'store/PapersContext.js';

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
    <ul aria-label="players list" css={Styles.lobby} {...otherProps}>
      {players.map((playerId, i) => {
        if (!game.players[playerId]) {
          const playerName = playerId.match('_(.*)_')[1];
          return (
            <li key={playerId} css={Styles.lobbyItem}>
              <span>
                <span css={Styles.lobbyAvatar} />
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
        const wordsStatus = !wordsSubmitted ? '[WRITTING]' : '[DONE]';

        return (
          <li key={id} css={Styles.lobbyItem}>
            {/* TODO - avatar component!! */}
            <span>
              <img src={avatar} alt="" css={Styles.lobbyAvatar} />
              <span
                css={css`
                  ${id === profileId ? 'font-weight: 600;' : ''}
                `}
              >
                {name}
              </span>
              &nbsp;
              <span>
                {isAdmin && ' (Admin) '}
                {isAfk && ' ⚠️ '}
              </span>
            </span>
            <span>
              {wordsStatus}
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
