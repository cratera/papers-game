/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Redirect, Link, useParams } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from './GameRoomStyles.js';
import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button.js';
import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const { id: urlGameId } = useParams();
  const Papers = useContext(PapersContext);
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
      return setStatus('leftGroup');
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

  const handleLeaveGroup = () => {
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
        <h1>Ups, this group doesn't seem to exist!</h1>{' '}
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Fragment>
    );
  }

  if (status === 'leftGroup' || !game) {
    return <Redirect push to="/" />;
  }

  if (status === 'ups') {
    return (
      <Fragment>
        <h1>Ups, something went wrong loading this group. See logs</h1>{' '}
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Fragment>
    );
  }

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
            console.log('player', id);
            const isAdmin = id === game.creatorId;
            return (
              <li key={id} css={Styles.lobbyItem}>
                {/* TODO - avatar component!! */}
                <img src={avatar} alt="" css={Styles.lobbyAvatar} />
                {name}
                {isAdmin && '    (Admin)'}
                {isAfk && '    ⚠️'}
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
        onClick={handleLeaveGroup}
      >
        Leave
      </Button>
      {playerIsAdmin && <Button onClick={() => true}>Create Teams</Button>}
    </main>
  );
}
