/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { typography as Typography, colors as Colors } from 'Theme.js';
import { usePrevious } from 'utils';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';

import Button from 'components/Button';
import ListPlayers from 'components/ListPlayers';
import Page from 'components/Page';

import WritePapersModal from './WritePapersModal.js';
import * as Styles from './LobbyStyles.js';

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
      component: WritePapersModal,
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
      return <p css={Typography.italic}>Waiting for your friends to join the game (Minimum 4).</p>;
    }
  }

  function renderLobbyStarting() {
    return (
      <Page>
        <Page.Header />
        <Page.Main>
          <div css={Styles.header}>
            {profileIsAdmin && (
              <p css={[Typography.small, Styles.cap]}>Ask your friends to join!</p>
            )}
            <span css={Styles.title(profileIsAdmin)}>
              <h1 css={Typography.h1}>{game.name}</h1>
              {profileIsAdmin && (
                <Button
                  variant="icon"
                  onClick={() =>
                    // TODO - share group link
                    alert(`Ask your friends to click "Join Game" and write "${game.name}"`)
                  }
                >
                  {/* prettier-ignore */}
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 6L12 2L8 6" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V15" stroke={Colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              )}
            </span>
          </div>
          <div>
            <h2 css={Typography.h3}>Lobby</h2>
            <ListPlayers players={Object.keys(game.players)} enableKickout />
          </div>
        </Page.Main>
        <Page.CTAs>{renderToTeamsCTA()}</Page.CTAs>
      </Page>
    );
  }

  function renderLobbyWritting() {
    const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords);
    const didSubmitWords = didSubmitAllWords(profileId);
    const writeAllShortCut = profileIsAdmin && !didEveryoneSubmittedTheirWords;

    return (
      <Page>
        <Page.Header />
        <Page.Main>
          <div css={Styles.header}>
            <h1 css={Typography.secondary}>
              {!didEveryoneSubmittedTheirWords ? 'Waiting for other players' : 'Everyone finished!'}
            </h1>
            <img
              css={Styles.headerImg}
              src={`/images/${!didEveryoneSubmittedTheirWords ? 'waiting' : 'done'}.gif`}
              alt=""
            />
          </div>
          <ul>
            {Object.keys(game.teams).map(teamId => {
              const { id, name, players } = game.teams[teamId];
              return (
                <li key={id} css={Styles.team}>
                  <h1 css={Typography.h3}>{name}</h1>
                  <ListPlayers players={players} />
                </li>
              );
            })}
          </ul>
        </Page.Main>
        <Page.CTAs>
          {!didSubmitWords && (
            <Button hasBlock onClick={openWords}>
              Write your papers
            </Button>
          )}
          {didEveryoneSubmittedTheirWords && profileIsAdmin && (
            <Button onClick={handleStartClick}>Start Game!</Button>
          )}
          {writeAllShortCut && (
            <Button variant="danger" hasBlock onClick={setWordsForEveyone}>
              {/* eslint-disable-next-line */}
              Write everyone's papers 💥
            </Button>
          )}
        </Page.CTAs>
      </Page>
    );
  }

  /* REVIEW - Hum... maybe create 2 routes? */
  return !game.teams ? renderLobbyStarting() : renderLobbyWritting();
}
