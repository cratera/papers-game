/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useEffect, useContext } from 'react';
// import { Link } from 'react-router-dom';

// import { typography as Typography } from 'Theme.js';
import * as Styles from './PlayingStyles.js';
import Button from 'components/Button.js';
import PapersContext from 'store/PapersContext.js';
import { useCountdown, usePrevious, getRandomInt } from 'utils';

export default function GameRoom(props) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  // const hasCountdownStarted = ['getReady', 'timesup'].includes(round.status);
  const [hasCountdownStarted, setFakeHasCountdownStarted] = useState(false);

  const [countdown, startCountdown] = useCountdown(null, { timer: 63400 }); // 3,2,1... go!
  const countdownSec = Math.round(countdown / 1000);
  const prevCountdownSec = usePrevious(countdownSec);
  const [timesUp, setTimesup] = useState(false);

  const roundIndex = round.current;
  const [turnTeamIndex, turnPlayerIndex] = round.turnWho;
  const turnPlayerId = game.teams[turnTeamIndex].players[turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  const [papersTurn, setPapersTurn] = useState({
    current: null, // String - current paper on the screen
    passed: [], // [String] - papers passed
    guessed: [], // [String] - papers guessed
    wordsLeft: round.wordsLeft, // [String] - words left
  });

  useEffect(() => {
    if (prevCountdownSec > 0 && countdownSec === 0) {
      console.log('TODO finishTurn()');
      setTimesup(true);
      // Papers.finishTurn(wordsGuessed);
    }
  }, [prevCountdownSec, countdownSec]);

  // function handleRestartClick() {
  //   startCountdown(Date.now());
  // }

  function pickNextPaper(hasGuessed = false) {
    // OPTIMIZE/NOTE : paper & word mean the same.
    const currentPaper = papersTurn.current;
    let wordsToPick = [];
    let pickingFrom = null; // 'left' || 'passed'
    let wordsEnded = false;

    if (papersTurn.wordsLeft.length > 0) {
      pickingFrom = 'left';
      wordsToPick = [...papersTurn.wordsLeft];
    } else if (papersTurn.passed.length > 0) {
      pickingFrom = 'passed';
      wordsToPick = [...papersTurn.passed];
    } else {
      wordsEnded = true;
    }

    setPapersTurn(state => {
      const wordsModified = {};
      const wordIndex = !wordsEnded && getRandomInt(wordsToPick.length - 1);
      let nextPaper = !wordsEnded && wordsToPick[wordIndex];

      if (!wordsEnded) {
        wordsToPick.splice(wordIndex, 1);
      } else {
        console.log('words ended!');
        return {
          ...state,
          current: null,
        };
      }

      if (!currentPaper) {
        // TODO - Clean this, only happens when starting turn.
        return {
          ...state,
          current: nextPaper,
          wordsLeft: wordsToPick,
        };
      }

      if (hasGuessed) {
        wordsModified.guessed = [...state.guessed, currentPaper];

        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick;
        } else if (pickingFrom === 'passed') {
          wordsModified.passed = wordsToPick;
        }
      } else {
        if (pickingFrom === 'left') {
          wordsModified.wordsLeft = wordsToPick;
          wordsModified.passed = [...state.passed, currentPaper];
        } else if (pickingFrom === 'passed') {
          if (wordsToPick.length > 0) {
            wordsModified.passed = [...wordsToPick, currentPaper];
          } else {
            // When it's the last word,
            // but no stress because button is disable
            nextPaper = currentPaper;
            wordsModified.passed = [];
          }
        }
      }

      return {
        ...state,
        ...wordsModified,
        current: nextPaper,
      };
    });
  }

  function handleStartClick() {
    console.log('TODO startTurn()');
    // Papers.startTurn()
    pickNextPaper();
    setFakeHasCountdownStarted(true);
    startCountdown(Date.now());
  }

  function rollbackToGetReady() {
    console.log('TODO rollback startTurn()');
    // Papers.startTurn()
    setFakeHasCountdownStarted(false);
    startCountdown(null);
    setTimesup(false);
    setPapersTurn({
      current: null,
      passed: [],
      guessed: [],
      wordsLeft: round.wordsLeft,
    });
  }

  const renderMyTurnGetReady = () => {
    return (
      <Fragment>
        <h2>It's your turn!</h2>
        [IMG EXPLAINING]
        <p>You ready?</p>
        <Button hasBlock onClick={handleStartClick}>
          Start now!
        </Button>
      </Fragment>
    );
  };

  const renderGo = () => {
    return (
      <Fragment>
        <br />
        {!timesUp ? (
          countdownSec > 60 ? (
            // 3, 2, 1...
            <p>{countdownSec - 60}...</p>
          ) : papersTurn.current ||
            papersTurn.passed.length > 0 ||
            papersTurn.wordsLeft.length > 0 ? (
            <Fragment>
              <Button hasBlock variant="success" onClick={() => pickNextPaper(true)}>
                Got it!
              </Button>
              <br />
              {countdownSec}
              <br /> - current: {papersTurn.current}
              <br /> - passed: {papersTurn.passed.join(', ')}
              <br /> - guessed: {papersTurn.guessed.join(', ')}
              <br /> - wordsLeft: {papersTurn.wordsLeft.join(', ')}
              <br />
              <br />
              {papersTurn.current && !papersTurn.wordsLeft.length && !papersTurn.passed.length ? (
                <p>----- Last paper!! -----</p>
              ) : (
                <Button hasBlock variant="light" onClick={() => pickNextPaper(false)}>
                  Next paper
                </Button>
              )}
            </Fragment>
          ) : (
            <p>There are no more words! TODO show results!</p>
          )
        ) : (
          <p>Times up! TODO show results!</p>
        )}

        <br />
        <br />
        <Button hasBlock variant="flat" onClick={rollbackToGetReady}>
          [DEBUG] - Rollback to getReady
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
        <br />
        <p>Turn {Number(round.turnCount).toString()}</p>
        <p>[avatar] {playerName}</p>
        <p>Team: {teamName}</p>
      </Fragment>
    );
  };

  return (
    <div css={Styles.page}>
      {!hasCountdownStarted && (
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
          ? !hasCountdownStarted
            ? renderMyTurnGetReady()
            : renderGo()
          : renderOtherTurnGetReady()}
      </div>
    </div>
  );
}
