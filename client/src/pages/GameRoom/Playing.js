/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useEffect, useContext } from 'react';

import { typography as Typography, colors } from 'Theme.js';
import * as Styles from './PlayingStyles.js';
import Avatar from 'components/Avatar';
import Button from 'components/Button';
import Page from 'components/Page';
import PapersContext from 'store/PapersContext.js';
import { useCountdown, usePrevious, getRandomInt, msToSecPretty } from 'utils';

export default function Playing(props) {
  const Papers = useContext(PapersContext);
  const { profile, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  const hasStatusFinished = round.status === 'finished';
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status);
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted);
  const profileIsAdmin = game.creatorId === profile.id;
  const initialTimer = 30000; // TODO - from Papers.settings?
  const timerReady = 3400;
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }); // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000);
  const countdownSec = Math.round(countdown / 1000);
  const blurTime = 1500;
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

  const [isVisiblePassedPapers, togglePassedPapers] = useState(false);
  const [paperAnim, setPaperAnimation] = useState(null);
  const [isPaperBlur, setPaperBlur] = useState(hasCountdownStarted);
  const [isPaperChanging, setIsPaperChanging] = useState(false);

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
    setTimeout(() => setPaperBlur(true), blurTime);
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
    setPaperBlur(false);
  }

  function handlePaperClick(hasGuessed) {
    if (isPaperChanging) {
      return;
    }
    // TODO / BUG clear all timeouts around...
    setPaperBlur(false);
    setIsPaperChanging(true);
    setPaperAnimation(hasGuessed ? 'gotcha' : 'nop');

    setTimeout(() => {
      setPaperAnimation(null);
      pickNextPaper(hasGuessed);
      setTimeout(() => setIsPaperChanging(false), 500);
      setTimeout(() => setPaperBlur(true), blurTime);
    }, 1000);
  }

  function togglePaper(paper, hasGuessed) {
    // TODO/BUG: When papers are all guessed and here I select one as not guessed.
    //  - The timer continues but the current word is empty.
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
    /* just to double check... */
    setPaperBlur(false);
    setIsPaperChanging(false);
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
        <Page.Main>
          <div css={Styles.header}>
            <h1 css={Styles.headerTitle}>It's your turn!</h1>
            <div css={Styles.inst.container}>
              <p css={Styles.inst.first}>Click here if your team guesses the paper</p>
              <img css={Styles.inst.img} src="/images/instructions.png" alt="instructions" />
              <p css={Styles.inst.second}>
                Click here to go to the next paper. don’t worry, you can always go back!
              </p>
            </div>
          </div>
          {isOdd && <p>Your team has one player less, so it's you again.</p>}
        </Page.Main>
        <Page.CTAs>
          <Button hasBlock onClick={handleStartClick}>
            Start now!
          </Button>
        </Page.CTAs>
      </Fragment>
    );
  };

  const renderTurnScore = type => {
    return (
      <Fragment>
        <Page.Main css={Styles.tscore.main}>
          <div css={Styles.tscore.header}>
            <p css={[Styles.tscore.headerKicker]}>
              {type === 'timesup' ? "Time's Up!" : 'All papers done!'}
            </p>
            <h1 css={Typography.h1}>
              Your team got <strong>{papersTurn.guessed.length}</strong> papers right!
            </h1>
          </div>
          {papersTurn.guessed.length ? (
            <ul css={Styles.tscore.list}>
              {papersTurn.guessed.map((paper, i) => (
                <li css={Styles.tscore.item} key={`${i}_${paper}`}>
                  {paper}
                  <Button
                    css={Styles.tscore.btn('remove')}
                    variant="icon"
                    aria-label="mark as not guessed"
                    onClick={() => togglePaper(paper, false)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p css={{ marginTop: '4rem' }}>More luck next time...</p>
          )}
          {!!papersTurn.passed.length && (
            <Button
              css={Styles.tscore.btnToggle}
              onClick={() => togglePassedPapers(bool => !bool)}
              variant="flat"
            >
              {isVisiblePassedPapers ? 'Hide' : 'Show'} the papers you didn't get
            </Button>
          )}
          {isVisiblePassedPapers && !!papersTurn.passed.length && (
            <ul css={Styles.tscore.list}>
              {papersTurn.passed.map((paper, i) => (
                <li css={Styles.tscore.item} key={`${i}_${paper}`}>
                  {paper}
                  <Button
                    css={Styles.tscore.btn('add')}
                    variant="icon"
                    aria-label="mark as guessed"
                    onClick={() => togglePaper(paper, true)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Page.Main>
        <Page.CTAs>
          <Button hasBlock onClick={handleFinishTurnClick}>
            Finish my turn
          </Button>
        </Page.CTAs>
      </Fragment>
    );
  };

  const renderRoundScore = () => {
    const teamsScore = {};
    const scorePlayers = game.score[round.current];
    let myTeamId = null;

    Object.keys(game.teams).forEach(teamId => {
      game.teams[teamId].players.forEach(playerId => {
        const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0;
        teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore;
        myTeamId = myTeamId || (playerId === profile.id ? teamId : null);
      });
    });

    const arrayOfScores = Object.values(teamsScore);
    const arrayOfTeamsId = Object.keys(teamsScore);
    const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
    const winnerId = arrayOfTeamsId[winnerIndex];
    const myTeamWon = myTeamId === winnerId;
    return (
      <Fragment>
        <Page.Main css={Styles.tscore.main}>
          <p css={Styles.tscore.headerKicker}>Round {roundIndex + 1} finished!</p>
          <h1 css={Typography.h1}>
            {myTeamWon ? (
              <span css={{ color: colors.success }}>Your team won!</span>
            ) : (
              <span css={{ color: colors.danger }}>Your team lost!</span>
            )}
          </h1>
          <ul>
            Scores:
            {Object.keys(teamsScore).map(teamId => (
              <li key={teamId}>
                {game.teams[teamId].name}: {teamsScore[teamId]}
              </li>
            ))}
          </ul>
        </Page.Main>
        <Page.CTAs>
          {round.current + 1 === game.settings.rounds.length ? (
            <Button hasBlock onClick={handleFinalWinnerClick}>
              Show final winner!
            </Button>
          ) : profileIsAdmin ? (
            <Button hasBlock onClick={handleStartNextRoundClick}>
              Start Round {round.current + 1 + 1} of {game.settings.rounds.length}
            </Button>
          ) : (
            <p css={{ textAlign: 'center' }}>
              Wait for admin ({game.players[game.creatorId].name}) to start next round.
            </p>
          )}
        </Page.CTAs>
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

    if (countdownSec > initialTimerSec) {
      return (
        <Page.Main>
          <p css={[Styles.count321, { marginTop: '20vh' }]}>{countdownSec - initialTimerSec}...</p>
        </Page.Main>
      );
    }

    return (
      <Fragment>
        <Page.Main>
          <Button
            hasBlock
            variant="success"
            css={isPaperChanging && Styles.go.ctaDim}
            onClick={() => handlePaperClick(true)}
          >
            Got it!
          </Button>
          <div css={Styles.go.main}>
            <p
              css={[
                Styles.count321,
                Styles.go.count,
                { marginTop: '3.2rem', color: countdown <= 10500 && colors.danger },
              ]}
            >
              {msToSecPretty(countdown)}
            </p>
            <div
              css={[Styles.go.paper, Styles.go[paperAnim]]}
              onMouseDown={() => setPaperBlur(false)}
              onTouchStart={() => setPaperBlur(false)}
              onMouseUp={() => setPaperBlur(true)}
              onTouchEnd={() => setPaperBlur(true)}
            >
              <span
                css={[
                  Styles.go.paperWord,
                  isPaperBlur && Styles.go.blur,
                  paperAnim === 'gotcha' && Styles.go.paperWordInsideGotch,
                ]}
              >
                {papersTurn.current}
              </span>
              <span css={Styles.go.tipBlur} aria-hidden="true">
                {isPaperBlur && !isPaperChanging && 'Press to reveal'}
              </span>
            </div>
          </div>
          <div hidden css={Typography.small}>
            <br /> - passed: {papersTurn.passed.join(', ')}
            <br /> - guessed: {papersTurn.guessed.join(', ')}
            <br /> - wordsLeft: {papersTurn.wordsLeft.join(', ')}
          </div>
        </Page.Main>
        <Page.CTAs>
          {papersTurn.current && !papersTurn.wordsLeft.length && !papersTurn.passed.length ? (
            <p css={{ textAlign: 'center', color: colors.grayMedium }}>Last paper!</p>
          ) : (
            <Button
              hasBlock
              variant="light"
              css={isPaperChanging && Styles.go.ctaDim}
              onClick={() => handlePaperClick(false)}
            >
              Next paper
            </Button>
          )}
        </Page.CTAs>
      </Fragment>
    );
  };

  const renderOthersTurn = () => {
    const teamName = game.teams[turnTeamIndex].name;
    const player = game.players[turnPlayerId];
    return (
      <Fragment>
        <Page.Main>
          <div css={Styles.to.wrapper}>
            <div css={Styles.header}>
              <h1 css={Styles.headerTitle}>Round {roundIndex + 1}</h1>
              <p css={Typography.secondary}>
                Try to guess as many papers as possible in 1 minute.{' '}
                {game.settings.rounds[roundIndex].description}
              </p>
            </div>
            <div css={Styles.to.main}>
              <p css={Typography.secondary}>
                {!hasCountdownStarted
                  ? 'Not started yet'
                  : countdownSec
                  ? 'The pressure is on!'
                  : 'Times up!'}
              </p>
              <p
                css={[
                  Typography.h1,
                  {
                    color:
                      hasCountdownStarted && countdown <= 10500 ? colors.danger : colors.primary,
                  },
                ]}
              >
                {hasCountdownStarted
                  ? countdownSec > initialTimerSec
                    ? countdownSec - initialTimerSec + '...' // 3, 2, 1...
                    : countdownSec
                    ? msToSecPretty(countdown) // counting...
                    : '00:00' // timeout
                  : msToSecPretty(initialTimer) // waiting to start
                }
              </p>
            </div>
          </div>
        </Page.Main>
        <Page.CTAs>
          <div css={Styles.tos.container}>
            <p css={[Styles.tos.title, Typography.h3]}>Turn {round.turnCount + 1}</p>
            <Avatar css={Styles.tos.avatar} hasMargin size="lg" src={player.avatar}></Avatar>
            <p css={[Styles.tos.name, Typography.h3]}>{player.name}</p>
            <p css={[Styles.tos.team, Typography.secondary]}>{teamName}</p>
          </div>
        </Page.CTAs>
      </Fragment>
    );
  };

  // ------- isFinalScore

  if (isFinalScore) {
    const teamsTotalScore = {};
    let myTeamId = null;

    const getRoundScore = roundIndex => {
      const scorePlayers = game.score[roundIndex];
      let teamsScore = {};
      let bestPlayer = {};

      Object.keys(game.teams).forEach(teamId => {
        game.teams[teamId].players.forEach(playerId => {
          myTeamId = myTeamId || (playerId === profile.id ? teamId : null);
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
      const myTeamWon = myTeamId === winnerId;

      return (
        <h1 css={[Typography.h1, { textAlign: 'center' }]}>
          {myTeamWon ? (
            <span css={{ color: colors.success }}>Your team won!</span>
          ) : (
            <span css={{ color: colors.danger }}>Your team lost!</span>
          )}
        </h1>
      );
    };

    return (
      <Page>
        <Page.Main>
          {getFinalWinner()}
          <br />
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
        </Page.Main>
        <Page.CTAs>
          <Button onClick={Papers.leaveGame}>Leave game</Button>
        </Page.CTAs>
      </Page>
    );
  }

  // -------- other stuff

  return (
    <Page>
      <Page.Header></Page.Header>
      {hasStatusFinished
        ? renderRoundScore()
        : isMyTurn
        ? !hasCountdownStarted
          ? renderMyTurnGetReady()
          : renderGo()
        : renderOthersTurn()}
    </Page>
  );
}
