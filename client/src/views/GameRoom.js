/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import PapersContext from 'store/PapersContext.js';
import Button from 'components/Button.js';
import { usePrevious } from 'utils';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  let { id: gameRoomId } = useParams();
  const [status, setStatus] = useState('loading');
  const { profile, game } = Papers.state;
  const gameIdStored = game && game.name;
  const prevgameIdStored = usePrevious(gameIdStored);

  useEffect(() => {
    console.log('/game', { gameRoomId, gameIdStored });

    if (gameRoomId === gameIdStored) {
      console.log('Game is stored - came from other page');
      Papers.recoverPlayer();
      setStatus('go');
      return;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevgameIdStored === undefined && gameIdStored === undefined) {
      console.log('/game joinining', gameRoomId);
      Papers.accessGame('join', gameRoomId, (err, result) => {
        console.log('accessGame result:', result);

        if (err) {
          const reactions = {
            notFound: () => {
              setStatus('notFound');
            },
            ups: result => {
              setStatus('ups');
            },
          };

          console.warn('accessGame', err);
          return (reactions[err] || reactions.ups)();
        }

        setStatus('go');
      });
    }
    // Disable rule because of Papers.accessGame - its always the same
  }, [gameIdStored]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return function onUnmount() {
      if (game) {
        Papers.pausePlayer();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeaveGroup = () => {
    if (game.creator === profile.name) {
      if (
        window.confirm(
          'You are the admin of this game. Leaving, will kick out everyone. Are you sure?'
        )
      ) {
        // Papers.killGame();
        // socket.emit(
        //   'kill-game',
        //   {
        //     gameId: game.name,
        //     creatorId: profile.id,
        //   },
        //   () => setGame(null)
        // );
      }
    } else {
      if (window.confirm('Are you sure you wanna leave the game?')) {
        // Papers.leaveGame();
        // socket.emit(
        //   'leave-game',
        //   {
        //     gameId: game.name,
        //     playerId: profile.id,
        //   },
        //   () => setGame(null)
        // );
      }
    }
  };

  if (status === 'loading') {
    return <h1>Loading...</h1>;
  }

  if (status === 'notFound') {
    return (
      <div>
        <h1>Ups, this group doesn't seem to exist!</h1>{' '}
        <Button as={Link} to="/">
          Go Home
        </Button>
      </div>
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
      <Button as={Link} to="/">
        Go Home
      </Button>
      <Button onClick={handleLeaveGroup}>Leave Game</Button>
    </Fragment>
  );
}
