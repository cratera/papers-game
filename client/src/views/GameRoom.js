/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useContext, useEffect } from 'react';
import { Switch, Route, Redirect, Link, useParams } from 'react-router-dom';

import Button from 'components/Button.js';
import PapersContext from 'store/PapersContext.js';
import GameLobby from './GameRoom/Lobby.js';
import GameTeams from './GameRoom/Teams.js';
import { usePrevious } from 'utils';
// import GameWords from './GameRoom/Words.js';
import GamePlaying from './GameRoom/Playing.js';

export default function GameRoom(props) {
  const { id: urlGameId } = useParams();
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const gameId = game && game.name;
  const profileId = profile && profile.id;
  const profileIsAfk = game && game.players[profileId].isAfk;
  const [status, setStatus] = useState('loading'); // needProfile || ready  || notFound
  const prevGameId = usePrevious(gameId);

  useEffect(() => {
    if (!profileId) {
      return false;
    }

    if (prevGameId && !gameId) {
      // This shoudn't be here... Global Status
      return setStatus('leftGame');
    }

    if (urlGameId === gameId) {
      if (profileIsAfk) {
        Papers.recoverPlayer();
      } else {
        setStatus('ready');
      }
    } else {
      Papers.accessGame('join', urlGameId, err => {
        if (err) {
          const errorMsgMap = {
            notFound: () => 'This game does not exist.',
            alreadyStarted: () => 'This game had already started.',
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
  }, [profileId, gameId, profileIsAfk]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLeaveGame = () => {
    if (
      window.confirm('Are you sure you wanna leave the game? You wont be able to join it again.')
    ) {
      Papers.leaveGame();
    }
  };

  // OPTIMIZE: This is asking for a switch / children mapping...

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

  return (
    <div>
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
      <Switch>
        <Route exact path="/game/:id">
          <Redirect to={`/game/${gameId}/lobby`} />
        </Route>
        <Route path="/game/:id/lobby">
          {!game.hasStarted ? <GameLobby /> : <Redirect to={`/game/${gameId}/playing`} />}
        </Route>
        <Route path="/game/:id/teams">
          {!game.teams ? <GameTeams /> : <Redirect to={`/game/${gameId}/lobby`} />}
        </Route>

        <Route path="/game/:id/playing">
          {game.hasStarted ? <GamePlaying /> : <Redirect to={`/game/${gameId}/lobby`} />}
        </Route>
        {/* <Route path="/game/:id/words">
        <GameWords />
      </Route> */}
        <Route path="*">
          <Redirect to="/game/:id" />
        </Route>
      </Switch>
    </div>
  );
}
