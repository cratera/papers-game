/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from '../GameRoomStyles.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import ModalWriteWords from 'views/ModalWriteWords.js';
import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const { setModal } = useContext(CoreContext);
  const { profile, game } = Papers.state;
  const profileId = profile.id;
  const profileIsAfk = game.players[profileId].isAfk;
  const profileIsAdmin = game.creatorId === profileId;

  const didSubmitAllWords = plId => {
    return game.words[plId] && game.words[plId].length === game.settings.words;
  };

  function openWords() {
    setModal({
      component: ModalWriteWords,
    });
  }

  function goTeams() {}

  const handleLeaveGame = () => {
    if (
      window.confirm('Are you sure you wanna leave the game? You wont be able to join it again.')
    ) {
      Papers.leaveGame();
    }
  };

  function handleKickOut(playerId) {
    const playerName = game.players[playerId].name;
    if (window.confirm(`You are about to kick ${playerName}. Are you sure?`)) {
      Papers.kickoutOfGame(playerId);
    }
  }

  function renderToTeamsCTA() {
    if (Object.keys(game.players).length >= 4) {
      return profileIsAdmin ? (
        <Button as={Link} hasBlock to="teams">
          Create teams!
        </Button>
      ) : (
        <p>Wait for {game.players[game.creatorId].name} to create the teams.</p>
      );
    } else {
      return <p>Waiting for your friends to join the game (Minimum 4).</p>;
    }
  }

  // Q: Maybe this should be done on the server. It's faster, right?
  const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords);
  const didSubmitWords = didSubmitAllWords(profileId);
  const hasTeams = game.teams;
  const allWords = Object.keys(game.players)
    .reduce((acc, playerId) => {
      return game.words[playerId] && typeof game.words[playerId] !== 'number'
        ? [...acc, ...game.words[playerId]]
        : acc;
    }, [])
    .join(', ');

  return (
    <main css={Styles.container}>
      <header css={Styles.header}>
        {profileIsAdmin && <p css={[Typography.small, Styles.cap]}>Ask your friends to join!</p>}
        <span
          css={css`
            display: flex;
            justify-content: center;
            ${profileIsAdmin && `padding-left: 3rem; /*emoji space*/`}
          `}
        >
          <h1 css={Typography.h1}>{game.name}</h1>
          {profileIsAdmin && (
            <Button
              variant="flat"
              aria-label="button share"
              // TODO this
              onClick={() =>
                alert(`Ask your friends to click "Join Game" and write "${game.name}"`)
              }
            >
              {/* eslint-disable-next-line */} 🔗
            </Button>
          )}
        </span>
      </header>
      <div>
        <h2 css={Typography.h3}>Lobby:</h2>
        {game.teams && <p>TODO TEAMS!</p>}
        <ul aria-label="Lobby" css={Styles.lobby}>
          {Object.keys(game.players).map((playerId, i) => {
            const { avatar, name, id, isAfk } = game.players[playerId];
            const isAdmin = id === game.creatorId;
            const wordsWritten = game.words[id] || 0;
            const wordsStatus =
              // If it's not a number, it's an array - it means all words were submitted.
              typeof wordsWritten === 'number'
                ? wordsWritten > 0
                  ? `✏️(${wordsWritten})`
                  : ''
                : '✅';

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
                  {profileIsAdmin && id !== profileId && (
                    <Button variant="light" size="sm" onClick={() => handleKickOut(id)}>
                      Kick out
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <button
        css={css`
          position: absolute;
          top: 0;
          left: 0;
        `}
        onClick={handleLeaveGame}
      >
        Leave
      </button>
      {!hasTeams && renderToTeamsCTA()}
      {hasTeams && !didSubmitWords && (
        <Button hasBlock onClick={openWords}>
          Write your papers
        </Button>
      )}
      {hasTeams && didSubmitWords && !didEveryoneSubmittedTheirWords && (
        <span>Waiting for everyone to have submitted their words ✏️</span>
      )}
      {hasTeams && didEveryoneSubmittedTheirWords && profileIsAdmin && (
        <Button onClick={() => alert(`TODO Shuffle all these words: ${allWords}`)}>
          Start round 1!
        </Button>
      )}
    </main>
  );
}
