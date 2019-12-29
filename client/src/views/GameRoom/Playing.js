/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useContext } from 'react';
// import { Link } from 'react-router-dom';

// import { typography as Typography } from 'Theme.js';
import * as Styles from './PlayingStyles.js';
import Button from 'components/Button.js';
import PapersContext from 'store/PapersContext.js';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  const countdownStarted = ['getReady', 'timesup'].includes(round.status) ? false : round.status;

  // const [countdown, setCountdown] = useState(null);
  const roundIndex = round.current;
  const [turnTeamIndex, turnPlayerIndex] = round.turn;
  const turnPlayerId = game.teams[turnTeamIndex].players[turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  console.log('countdownStarted', countdownStarted);
  // Papers.finishTurn(wordsGuessed);

  const renderMyTurnGetReady = () => {
    return (
      <Fragment>
        <h2>It's your turn!</h2>
        [IMG EXPLAINING]
        <p>You ready?</p>
        <Button onClick={Papers.startTurn}>Start now!</Button>
      </Fragment>
    );
  };

  const renderGo = () => {
    return (
      <Fragment>
        <Button hasBlock variant="success">
          Got it!
        </Button>
        <br />
        <h2>[TODO Countdown... ({countdownStarted})]</h2>
        [TODO Fetch random Paper]
        <br />
        <br />
        <Button hasBlock variant="light">
          Next paper
        </Button>
      </Fragment>
    );
  };

  const renderOtherTurnGetReady = () => {
    const teamName = game.teams[turnTeamIndex].name;
    const playerName = game.players[turnPlayerId].name;

    return (
      <Fragment>
        Wait for your turn...
        <div>{countdownStarted ? '[TODO Countdown:]' + countdownStarted : ''}</div>
        <h2>
          Team: {teamName}; Player: {playerName};
        </h2>
      </Fragment>
    );
  };

  return (
    <div css={Styles.page}>
      {!countdownStarted && (
        <header>
          <h1>Round {roundIndex + 1}</h1>
          <p>
            Try to guess as many papers as possible in 1 minute.{' '}
            {game.settings.rounds[roundIndex].description}
          </p>
          <br />
        </header>
      )}
      <div>
        <br />
        {isMyTurn
          ? !countdownStarted
            ? renderMyTurnGetReady()
            : renderGo()
          : renderOtherTurnGetReady()}
      </div>
    </div>
  );
}
