/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Redirect, Link, useParams } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from './GameRoomStyles.js';
import Button from 'components/Button.js';
import CoreContext from 'store/CoreContext.js';
import PapersContext from 'store/PapersContext.js';
import ModalWriteWords from 'views/ModalWriteWords.js';
import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const { id: urlGameId } = useParams();
  const Papers = useContext(PapersContext);
  const { setModal } = useContext(CoreContext);
  const { profile, game } = Papers.state;
  const gameId = game && game.name;
  const profileId = profile && profile.id;
  const playerIsAfk = game && game.players[profileId].isAfk;
  const playerIsAdmin = game && game.creatorId === profileId;
  const [status, setStatus] = useState('loading'); // needProfile || ready  || notFound
  const prevGameId = usePrevious(gameId);

  useEffect(() => {
    if (!profileId) {
      return false;
    }

    if (prevGameId && !gameId) {
      return setStatus('leftGame');
    }

    if (urlGameId === gameId) {
      if (playerIsAfk) {
        Papers.recoverPlayer();
      } else {
        setStatus('ready');
      }
    } else {
      Papers.accessGame('join', urlGameId, err => {
        if (err) {
          // TODO - Move this out of here - redux(mapstatetoprops?)/context/wtv...
          const errorMsgMap = {
            notFound: () => 'This game does not exist.',
            ups: () => `Ups, something went wrong! Error: ${JSON.stringify(err)}`,
          };

          const errrorType = errorMsgMap[err] ? err : 'ups';
          const errorMsg = errorMsgMap[errrorType]();

          console.warn('/game/:id - accessGame failed:', gameId, errorMsg, err);

          return setStatus(errrorType);
        }
      });
    }
    // Papers doesnt need to be a dep - its a method.
  }, [profileId, gameId, playerIsAfk]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeaveGame = () => {
    if (
      window.confirm('Are you sure you wanna leave the game? You wont be able to join it again.')
    ) {
      Papers.leaveGame();
    }
  };

  // This is asking for a switch / children mapping...

  if (status === 'loading') {
    return <h1>Loading...</h1>;
  }

  if (!profileId) {
    return (
      <Fragment>
        <h1>To join {gameId} you need to create a profile before!</h1>
        <br />
        <Button as={Link} to="/">
          Create profile
        </Button>
      </Fragment>
    );
  }

  if (status === 'notFound') {
    return (
      <Fragment>
        <h1>Ups, the game "{urlGameId}"" doesn't seem to exist!</h1>{' '}
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Fragment>
    );
  }

  if (status === 'leftGame' || !game) {
    return <Redirect push to="/" />;
  }

  if (status === 'ups') {
    return (
      <Fragment>
        <h1>Ups, something went wrong loading this game. See logs</h1>{' '}
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Fragment>
    );
  }

  function openWords() {
    setModal({
      component: ModalWriteWords,
    });
  }

  const didSubmitAllWords = plId => {
    return game.words[plId] && game.words[plId].length === game.settings.words;
  };
  // Q: Maybe this should be done on the server. It's faster, right?
  const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords);
  const didSubmitWords = didSubmitAllWords(profileId);
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
        <p css={[Typography.small, Styles.cap]}>Ask your friends to join!</p>

        <span
          css={css`
            display: flex;
            justify-content: center;
            padding-left: 3rem; /*emoji space*/
          `}
        >
          <h1 css={Typography.h1}>{game.name}</h1>
          <Button
            variant="flat"
            aria-label="button share"
            onClick={() =>
              alert(
                `Not implemented... but until then, ask your friends to click "Join Game" and write "${game.name}"`
              )
            }
          >
            {/* eslint-disable-next-line */} 🔗
          </Button>
        </span>
      </header>
      <div>
        <h2 css={Typography.h3}>Lobby:</h2>
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
                <span>{wordsStatus}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <Button
        variant="flat"
        css={css`
          text-align: left;
          position: absolute;
          top: 0;
          left: 0;
        `}
        onClick={handleLeaveGame}
      >
        Leave
      </Button>
      {!didSubmitWords && (
        <Button hasBlock onClick={openWords}>
          Write your papers
        </Button>
      )}
      {didSubmitWords && !didEveryoneSubmittedTheirWords && (
        /* eslint-disable-next-line */
        <span>Waiting for everyone to have submitted their words ✏️</span>
      )}
      {didEveryoneSubmittedTheirWords && playerIsAdmin && (
        <Button
          onClick={() =>
            alert(`TODO: We have teams to build and all this words to shuffle: ${allWords}`)
          }
        >
          Create Teams
        </Button>
      )}
    </main>
  );
}
