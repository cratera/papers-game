/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button.js';
// import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const { id: urlGameId } = useParams();
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const gameId = game && game.name;
  const profileId = profile && profile.id;
  const playerIsAfk = game && game.players[profileId].isAfk;
  const [status, setStatus] = useState('loading');
  // const prevgameIdStored = usePrevious(gameIdStored);

  useEffect(() => {
    if (!profileId) {
      return setStatus('needProfile');
    }

    if (gameId === urlGameId) {
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

  useEffect(() => {
    return () => {
      if (gameId) {
        Papers.pausePlayer();
      }
    };
    // onUnmount, Papers is always the same
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeaveGroup = () => {
    if (
      window.confirm('Are you sure you wanna leave the game? You wont be able to join it again.')
    ) {
      Papers.leaveGame();
    }
  };

  if (status === 'needProfile') {
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

  if (status === 'loading') {
    return <h1>Loading...</h1>;
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
    <Fragment>
      <p>
        A game "{game.name}" created by {game.creator} is starting here!
      </p>
      <h1>Players:</h1>
      <ul>
        {Object.keys(game.players).map(playerId => {
          const { avatar, name, isAfk } = game.players[playerId];

          return (
            <li key={playerId}>
              {/* TODO - avatar component!! */}-{' '}
              <img
                src={avatar}
                alt=""
                css={css`
                  width: 2.5rem;
                  height: 2.5rem;
                  object-fit: cover;
                  border-radius: 50%;
                  margin-right: 1rem;
                `}
              />
              {name}
              {isAfk && '⚠️'}
            </li>
          );
        })}
      </ul>
      <Button onClick={handleLeaveGroup}>Leave Game</Button>
    </Fragment>
  );
}
