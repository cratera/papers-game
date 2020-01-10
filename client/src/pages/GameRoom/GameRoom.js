/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect } from 'react';
import { Switch, Route, Redirect, Link, useParams } from 'react-router-dom';

import PapersContext from 'store/PapersContext.js';
import Page from 'components/Page';
import Button from 'components/Button';
import GameLobby from './Lobby.js';
import GameTeams from './Teams.js';
import { usePrevious } from 'utils';
// import GameWords from './Words.js'; // TODO/OPTIMIZE - Turn Modal into route.
import GamePlaying from './Playing.js';

export default function(props) {
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
      // TODO - do this validation on App.js?
      return setStatus('noProfile');
    }

    if (prevGameId && !gameId) {
      // REVIEW - This shoudn't be here... Global Status
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

  const Template = ({ children }) => (
    <Page>
      <Page.Header />
      <Page.Main>{children}</Page.Main>
    </Page>
  );

  if (!profileId) {
    return (
      <Template>
        <h1>To join {gameId} you need to create a profile before!</h1>
        {/* TODO - @mmbotelho - improve this flow  */}
        <br />
        <Button as={Link} to="/">
          Create profile
        </Button>
      </Template>
    );
  }

  if (status === 'loading') {
    return (
      <Template>
        <h1>Loading...</h1>
      </Template>
    );
  }

  if (status === 'notFound') {
    return (
      <Template>
        <h1>Ups, the game "{urlGameId}" doesn't seem to exist!</h1>
        <br />
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Template>
    );
  }

  if (status === 'leftGame' || !game) {
    return <Redirect push to="/" />;
  }

  if (status === 'ups') {
    return (
      <Template>
        <h1>Ups, something went wrong while loading {gameId}.</h1>
        <br />
        <Button as={Link} to="/">
          Go Home
        </Button>
      </Template>
    );
  }

  const gamePath = `/game/${gameId}`;

  return (
    <Switch>
      <Route exact path="/game/:id">
        <Redirect to={`${gamePath}/lobby`} />
      </Route>
      <Route path="/game/:id/lobby">
        {!game.hasStarted ? <GameLobby /> : <Redirect to={`${gamePath}/playing`} />}
      </Route>
      <Route path="/game/:id/teams">
        {!game.teams ? <GameTeams /> : <Redirect to={`${gamePath}/lobby`} />}
      </Route>

      <Route path="/game/:id/playing">
        {game.hasStarted ? <GamePlaying /> : <Redirect to={`${gamePath}/lobby`} />}
      </Route>
      {/* <Route path="/game/:id/words">
        <GameWords />
      </Route> */}
      <Route path="*">
        <Redirect to={`${gamePath}/lobby`} />
      </Route>
    </Switch>
  );
}
