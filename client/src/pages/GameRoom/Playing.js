/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useState, useEffect, useContext } from 'react';
// import { Link } from 'react-router-dom';

import { typography as Typography } from 'Theme.js';
import * as Styles from './PlayingStyles.js';
import Button from 'components/Button';
import Page from 'components/Page';
import PapersContext from 'store/PapersContext.js';
import { useCountdown, usePrevious, getRandomInt } from 'utils';

export default function Playing(props) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  const hasStatusFinished = round.status === 'finished';
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status);
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted);
  const profileIsAdmin = game.creatorId === profile.id;
  const initialTimer = 10000; // TODO - from Papers.settings?
  const timerReady = 3400;
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }); // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000);
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
  const [isFinalScore, setFinalScore] = useState(null);

  useEffect(() => {
    // use false to avoid undefined on first render.
    if (prevHasCountdownStarted === false && hasCountdownStarted) {
      console.log('useEffect:: hasCountdownStarted');
      pickFirstPaper();
      startCountdown(round.status);
    }
  }, [startCountdown, round.status, prevHasCountdownStarted, hasCountdownStarted]); // eslint-disable-line

  // TODO/NOTE: pickFirstPaper, pickNextPaper and togglePaper should be on PapersContext
  function pickFirstPaper() {
    setPapersTurn(() => {
      const state = {
        current: null,
        passed: [],
        guessed: [],
        wordsLeft: round.wordsLeft,
      };

      if (round.wordsLeft.length === 0) {
        // words ended
        window.localStorage.setItem('turn', JSON.stringify(state));
        return state;
      }

      const wordsToPick = [...state.wordsLeft];

      const wordIndex = getRandomInt(wordsToPick.length - 1);
      const nextPaper = wordsToPick[wordIndex];

      wordsToPick.splice(wordIndex, 1);

      state.current = nextPaper;
      state.wordsLeft = wordsToPick;

      window.localStorage.setItem('turn', JSON.stringify(state));
      return state;
    });
  }

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
      let nextPaper = wordsEnded ? null : wordsToPick[wordIndex];

      if (!wordsEnded) {
        wordsToPick.splice(wordIndex, 1);
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
            // but no stress because "next paper" button is disable
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

        wordsModified.guessed = [...state.guessed, paper];
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
    // setPapersTurn({}); should it be done here?
    Papers.finishTurn(papersTurn);
  }

  function handleStartNextRoundClick() {
    Papers.startNextRound();
  }

  function handleFinalWinnerClick() {
    setFinalScore(true);
  }

  // ----------------

  const renderMyTurnGetReady = () => {
    return (
      <Fragment>
        <h2>It's your turn!</h2>
        [IMG EXPLAINING]
        {isOdd && <p>Your team has one player less, so it's you again.</p>}
        <p>You ready?</p>
        <br />
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
    const teamsScore = {};
    const scorePlayers = game.score[round.current];

    Object.keys(game.teams).forEach(teamId => {
      game.teams[teamId].players.forEach(playerId => {
        const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0;
        teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore;
      });
    });

    const arrayOfScores = Object.values(teamsScore);
    const arrayOfTeamsId = Object.keys(teamsScore);
    const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
    const winnerId = arrayOfTeamsId[winnerIndex];

    return (
      <Fragment>
        <h1>Round finished!</h1>
        <div>Winner: {game.teams[winnerId].name}</div>
        <ul>
          Scores:
          {Object.keys(teamsScore).map(teamId => (
            <li key={teamId}>
              {game.teams[teamId].name}: {teamsScore[teamId]}
            </li>
          ))}
        </ul>
        <br />
        {round.current + 1 === game.settings.rounds.length ? (
          <Button hasBlock onClick={handleFinalWinnerClick}>
            Show final winner!
          </Button>
        ) : profileIsAdmin ? (
          <Button hasBlock onClick={handleStartNextRoundClick}>
            Start Round {round.current + 1 + 1} of {game.settings.rounds.length}
          </Button>
        ) : (
          <p>Wait for admin ({game.players[game.creatorId].name}) to start next round.</p>
        )}
      </Fragment>
    );
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
        {countdownSec > initialTimerSec ? (
          // 3, 2, 1...
          <p>{countdownSec - initialTimerSec}...</p>
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
            <br /> - wordsLeft:{' '}
            <span css={Typography.small}>{papersTurn.wordsLeft.join(', ')}</span>
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
          countdownSec > initialTimerSec ? (
            // 3, 2, 1...
            <p>{countdownSec - initialTimerSec}...</p>
          ) : (
            countdown + '(ms)'
          )
        ) : (
          0
        )}
        <br />
        <p>Turn: {Number(round.turnCount).toString()}</p>
        <p>Team: {teamName}</p>
        <p>Player: {playerName}</p>
      </Fragment>
    );
  };

  if (isFinalScore) {
    const teamsTotalScore = {};

    const getRoundScore = roundIndex => {
      const scorePlayers = game.score[roundIndex];
      let teamsScore = {};
      let bestPlayer = {};

      Object.keys(game.teams).forEach(teamId => {
        game.teams[teamId].players.forEach(playerId => {
          const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0;
          if (playerScore > (bestPlayer.score || 0)) {
            bestPlayer = { score: playerScore, id: playerId };
          }
          teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore;
        });

        teamsTotalScore[teamId] = (teamsTotalScore[teamId] || 0) + teamsScore[teamId];
      });

      const arrayOfScores = Object.values(teamsScore);
      const arrayOfTeamsId = Object.keys(teamsScore);
      // const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
      // const winnerId = arrayOfTeamsId[winnerIndex];

      return {
        arrayOfScores,
        arrayOfTeamsId,
        bestPlayer,
      };
    };

    const scores = game.settings.rounds.map((round, index) => getRoundScore(index));

    const getFinalWinner = () => {
      const arrayOfScores = Object.values(teamsTotalScore);
      const arrayOfTeamsId = Object.keys(teamsTotalScore);
      const winnerScore = Math.max(...arrayOfScores);
      const winnerIndex = arrayOfScores.indexOf(winnerScore);
      const winnerId = arrayOfTeamsId[winnerIndex];

      return `${game.teams[winnerId].name}: (${winnerScore})`;
    };

    console.log('final scores:', scores);
    return (
      <div css={Styles.page}>
        {scores.map((round, index) => {
          return (
            <Fragment key={index}>
              <p>Round {index}:</p>
              <ul>
                {Object.keys(round.arrayOfTeamsId).map((teamId, index) => (
                  <li key={teamId}>
                    {game.teams[teamId].name}: {round.arrayOfScores[index]}
                  </li>
                ))}
              </ul>
              <p>
                Best Player: {game.players[round.bestPlayer.id].name} ({round.bestPlayer.score})
              </p>
              <br />
            </Fragment>
          );
        })}
        <br />
        <p>**Final Team Winner** {getFinalWinner()}</p>
        <br />
        <Button onClick={Papers.leaveGame}>Leave game</Button>
      </div>
    );
  }

  return (
    <Page>
      <Page.Header>
        <strong css={Typography.h3}>[ 🚧 🙈 It works, but it's ugly!]</strong>
      </Page.Header>
      <Page.Main>
        {!hasCountdownStarted && (
          <header>
            <h1>Round {roundIndex + 1}</h1>
            <p>
              Try to guess as many papers as possible in 1 minute. <br />
              {game.settings.rounds[roundIndex].description}
            </p>
            <br />
          </header>
        )}
        <div>
          {isMyTurn
            ? hasStatusFinished
              ? renderRoundScore()
              : !hasCountdownStarted
              ? renderMyTurnGetReady()
              : renderGo()
            : hasStatusFinished
            ? renderRoundScore()
            : renderOtherTurnGetReady()}
        </div>
      </Page.Main>
    </Page>
  );
}
