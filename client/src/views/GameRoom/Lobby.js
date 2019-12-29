/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from '../GameRoomStyles.js';
import Button from 'components/Button.js';
import ListPlayers from 'components/ListPlayers.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import ModalWriteWords from 'views/ModalWriteWords.js';
import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const { setModal } = useContext(CoreContext);
  const { profile, game } = Papers.state;
  const profileId = profile.id;
  const profileIsAdmin = game.creatorId === profileId;
  const hasTeams = !!game.teams;
  const prevHasTeams = usePrevious(!!game.teams);

  const didSubmitAllWords = plId => {
    return game.words[plId] && game.words[plId].length === game.settings.words;
  };

  useEffect(() => {
    if (!prevHasTeams && hasTeams) {
      // Teams were submited, force words!
      !didSubmitAllWords(profileId) && openWords();
    }
  });

  function openWords() {
    setModal({
      component: ModalWriteWords,
    });
  }

  function setWordsForEveyone() {
    Papers.setWordsForEveyone();
  }

  function handleStartClick() {
    Papers.startGame();
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

  function renderLobbyStarting() {
    return (
      <Fragment>
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
          <ListPlayers players={Object.keys(game.players)} />
        </div>
        {renderToTeamsCTA()}
      </Fragment>
    );
  }

  function renderLobbyWritting() {
    const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords);
    const didSubmitWords = didSubmitAllWords(profileId);
    const writeAllShortCut = !didEveryoneSubmittedTheirWords;

    return (
      <Fragment>
        <header css={Styles.header}>
          {!didEveryoneSubmittedTheirWords ? (
            <span>Waiting for other players [GIF]</span>
          ) : (
            <span>Everyone finished! [GIF]</span>
          )}
        </header>
        <div>
          {Object.keys(game.teams).map(teamId => {
            const { id, name, players } = game.teams[teamId];
            return (
              <div key={id} css={Styles.team}>
                <header css={Styles.headerTeam}>
                  <h1 css={Typography.h3}>{name}</h1>
                </header>
                <ListPlayers players={players} />
              </div>
            );
          })}
        </div>
        {writeAllShortCut && (
          <Button
            hasBlock
            onClick={setWordsForEveyone}
            css={css`
              margin-bottom: 1rem;
            `}
          >
            {/* eslint-disable-next-line */}
            Write everyone's papers 💥
          </Button>
        )}
        {!didSubmitWords && (
          <Button hasBlock onClick={openWords}>
            Write your papers
          </Button>
        )}
        {didEveryoneSubmittedTheirWords && profileIsAdmin && (
          <Button onClick={handleStartClick}>Start Game!</Button>
        )}
      </Fragment>
    );
  }

  return (
    <main css={Styles.container}>
      {!game.teams ? renderLobbyStarting() : renderLobbyWritting()}
    </main>
  );
}
