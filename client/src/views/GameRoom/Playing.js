/** @jsx jsx */
import { jsx, css } from '@emotion/core';
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
  const hasStatusFinished = round.status === 'finished';
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status);
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted);

  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: 63400, // 400 - threshold for io connection.
  }); // 3,2,1... go!
  const countdownSec = Math.round(countdown / 1000);
  // const prevCountdownSec = usePrevious(countdownSec);
  // const [timesUp, setTimesup] = useState(false);

  const roundIndex = round.current;
  const [turnTeamIndex, turnPlayerIndex, isOdd] = round.turnWho;
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  const [papersTurn, setPapersTurn] = useState(
    JSON.parse(window.localStorage.getItem('turn')) || {
      current: null, // String - current paper on the screen
      passed: [], // [String] - papers passed
      guessed: [], // [String] - papers guessed
      wordsLeft: round.wordsLeft, // [String] - words left
    }
  );

  useEffect(() => {
    if (!prevHasCountdownStarted && hasCountdownStarted) {
      console.log('useEffect, hasCountdownStarted');
      if (!papersTurn.current) {
        // CONTINUE HERE - REMOVE THIS CORRECTLY WHEN A ROUND STARTS
        //window.localStorage.removeItem('turn'); // OPTIMIZE - maybe it shouldnt be here?
        pickNextPaper(false);
      }
      startCountdown(round.status);
    }
  }, [startCountdown, round.status, prevHasCountdownStarted, hasCountdownStarted]);

  // TODO/NOTE: pickNextPaper and togglePaper should be on PapersContext
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
        const newState = {
          ...state,
          current: null,
        };

        window.localStorage.setItem('turn', JSON.stringify(newState));
        return newState;
      }

      if (!currentPaper) {
        // TODO - Clean this, only happens when starting turn.
        const newState = {
          ...state,
          current: nextPaper,
          wordsLeft: wordsToPick,
        };
        window.localStorage.setItem('turn', JSON.stringify(newState));
        return newState;
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

      const newState = {
        ...state,
        ...wordsModified,
        current: nextPaper,
      };

      window.localStorage.setItem('turn', JSON.stringify(newState));
      return newState;
    });
  }

  function togglePaper(paper, hasGuessed) {
    setPapersTurn(state => {
      const wordsModified = {};
      if (hasGuessed) {
        const wordsToPick = [...state.passed];
        const wordIndex = wordsToPick.indexOf(paper);
        wordsToPick.splice(wordIndex, 1);

        wordsModified.guessed = [...state.passed, paper];
        wordsModified.passed = wordsToPick;
      } else {
        const wordsToPick = [...state.guessed];
        const wordIndex = wordsToPick.indexOf(paper);
        wordsToPick.splice(wordIndex, 1);

        wordsModified.guessed = wordsToPick;
        wordsModified.passed = [...state.passed, paper];
      }

      const newState = {
        ...state,
        ...wordsModified,
      };

      window.localStorage.setItem('turn', JSON.stringify(newState));
      return newState;
    });
  }

  function handleStartClick() {
    Papers.startTurn();
    // pickNextPaper();
    // setFakeHasCountdownStarted(true);
    // startCountdown(Date.now());
  }

  function handleFinishTurnClick() {
    Papers.finishTurn(papersTurn);
  }

  // function rollbackToGetReady() {
  //   console.log('TODO rollback startTurn()');
  //   // Papers.startTurn()
  //   setFakeHasCountdownStarted(false);
  //   startCountdown(null);
  //   setTimesup(false);
  //   setPapersTurn({
  //     current: null,
  //     passed: [],
  //     guessed: [],
  //     wordsLeft: round.wordsLeft,
  //   });
  // }

  const renderMyTurnGetReady = () => {
    return (
      <Fragment>
        <h2>It's your turn!</h2>
        [IMG EXPLAINING]
        {isOdd && <p>Your team has one player less, so it's you again.</p>}
        <p>You ready?</p>
        <Button hasBlock onClick={handleStartClick}>
          Start now!
        </Button>
      </Fragment>
    );
  };

  const renderTurnScore = type => {
    const StyleLi = css`
      display: flex;
      justify-content: space-between;
      padding: 0.8rem 0;
      border-bottom: 1px solid #eee;
    `;
    return (
      <Fragment>
        <h1>{type === 'timesup' ? "Time's Up!" : 'No more words'}</h1>
        <p>
          Your team got <strong>{papersTurn.guessed.length}</strong> papers!
        </p>
        <p>Guessed:</p>
        <ul>
          {papersTurn.guessed.map((paper, i) => (
            <li css={StyleLi} key={`${i}_${paper}`}>
              - {paper}
              <Button
                variant="flat"
                aria-label="mark as not guessed"
                onClick={() => togglePaper(paper, false)}
              >
                {/* eslint-disable-next-line */}✅
              </Button>{' '}
            </li>
          ))}
        </ul>
        <p>Passed:</p>
        <ul>
          {papersTurn.passed.map((paper, i) => (
            <li css={StyleLi} key={`${i}_${paper}`}>
              - {paper}
              <Button
                variant="flat"
                aria-label="mark as guessed"
                onClick={() => togglePaper(paper, true)}
              >
                {/* eslint-disable-next-line */}❌
              </Button>
            </li>
          ))}
        </ul>
        <Button hasBlock onClick={handleFinishTurnClick}>
          Finish my turn
        </Button>
      </Fragment>
    );
  };

  const renderRoundScore = () => {
    return <p>Round finished! [Show results]</p>;
  };

  const renderGo = () => {
    const stillHasWords =
      papersTurn.current || papersTurn.passed.length > 0 || papersTurn.wordsLeft.length > 0;

    if (!stillHasWords) {
      return renderTurnScore('nowords');
    }

    if (countdownSec === 0) {
      return renderTurnScore('timesup');
    }

    return (
      <Fragment>
        <br />
        {countdownSec > 60 ? (
          // 3, 2, 1...
          <p>{countdownSec - 60}...</p>
        ) : (
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
        )}
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
        Timer:{' '}
        {countdownSec ? (
          countdownSec > 60 ? (
            // 3, 2, 1...
            <p>{countdownSec - 60}...</p>
          ) : (
            countdown
          )
        ) : (
          0
        )}
        <br />
        <p>Turn {Number(round.turnCount).toString()}</p>
        <p>Team: {teamName}</p>
        <p>Player: {playerName}</p>
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
          ? hasStatusFinished
            ? renderRoundScore()
            : !hasCountdownStarted
            ? renderMyTurnGetReady()
            : renderGo()
          : renderOtherTurnGetReady()}
      </div>
    </div>
  );
}
