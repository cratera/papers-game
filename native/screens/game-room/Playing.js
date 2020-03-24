import React, { Fragment } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';

import { useCountdown, usePrevious, getRandomInt, msToSecPretty } from '@constants/utils';
import PapersContext from '@store/PapersContext.js';

import * as Theme from '@theme';
import Button from '@components/button';
import Page from '@components/page';
// import Avatar from '@components/avatar';
const Avatar = () => null;
// import * as Styles from './PlayingStyles.js';
const Styles = {
  tos: {},
  inst: {},
  tscore: {
    btn: () => null,
    item: {
      display: 'flex',
      flexWrap: 'nowrap',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  go: {},
  to: {},
};

const DESCRIPTIONS = [
  'Use as many words as you need!',
  'Use only 3 words to describe the paper!',
  'Mimicry time, No talking!',
];

export default function Playing(props) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  const hasStatusFinished = round.status === 'finished';
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status);
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted);
  const profileIsAdmin = game.creatorId === profile.id;
  const initialTimer = 60000; // TODO - from Papers.settings?
  const timerReady = 3400;
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }); // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000);
  const countdownSec = Math.round(countdown / 1000);
  const blurTime = 1500;
  // const prevCountdownSec = usePrevious(countdownSec);
  // const [timesUp, setTimesup] = React.useState(false);

  const roundIndex = round.current;
  const { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd } = round.turnWho;
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  const [papersTurn, setPapersTurn] = React.useState(
    {}
    // JSON.parse(window.localStorage.getItem('turn')) || {
    //   current: null, // String - current paper on the screen
    //   passed: [], // [String] - papers passed
    //   guessed: [], // [String] - papers guessed
    //   wordsLeft: round.wordsLeft, // [String] - words left
    // }
  );
  const [isFinalScore, setFinalScore] = React.useState(null);

  const [isVisiblePassedPapers, togglePassedPapers] = React.useState(false);
  const [paperAnim, setPaperAnimation] = React.useState(null);
  const [isPaperBlur, setPaperBlur] = React.useState(hasCountdownStarted);
  const [isPaperChanging, setIsPaperChanging] = React.useState(false);

  React.useEffect(() => {
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
        // window.localStorage.setItem('turn', JSON.stringify(state));
        return state;
      }

      const wordsToPick = [...state.wordsLeft];

      const wordIndex = getRandomInt(wordsToPick.length - 1);
      const nextPaper = wordsToPick[wordIndex];

      wordsToPick.splice(wordIndex, 1);

      state.current = nextPaper;
      state.wordsLeft = wordsToPick;

      // window.localStorage.setItem('turn', JSON.stringify(state));
      return state;
    });
    setPaperBlur(false);
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

      // window.localStorage.setItem('turn', JSON.stringify(newState));
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

      // window.localStorage.setItem('turn', JSON.stringify(newState));
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
          <View style={Styles.header}>
            <Text style={Styles.headerTitle}>It's your turn!</Text>
            <View style={Styles.inst.container}>
              {/* <Text style={Styles.inst.first}>Click here if your team guesses the paper</Text> */}
              {/* <img style={Styles.inst.img} src="/images/instructions.png" alt="instructions" /> */}
              {/* <Text style={Styles.inst.second}>
                Click here to go to the next paper. Don’t worry, you can always go back!
              </Text> */}
            </View>
          </View>
          {isOdd && <Text>Your team has one player less, so it's you again.</Text>}
        </Page.Main>
        <Page.CTAs>
          <Button onPress={handleStartClick}>Start now!</Button>
        </Page.CTAs>
      </Fragment>
    );
  };

  const renderTurnScore = type => {
    return (
      <Fragment>
        <Page.Main style={Styles.tscore.main}>
          <View style={Styles.tscore.header}>
            <Text style={[Styles.tscore.headerKicker]}>
              {type === 'timesup' ? "Time's Up!" : 'All papers done!'}
            </Text>
            <Text style={Theme.typography.h1}>
              Your team got <Text>{papersTurn.guessed.length}</Text> papers right!
            </Text>
          </View>
          <View>
            {/* review height */}
            <ScrollView style={{ height: 245 }}>
              {papersTurn.guessed.length ? (
                <View style={Styles.tscore.list}>
                  {papersTurn.guessed.map((paper, i) => (
                    <View style={[Styles.tscore.item]} key={`${i}_${paper}`}>
                      <Text>{paper}</Text>
                      <Button
                        style={Styles.tscore.btn('remove')}
                        variant="icon"
                        aria-label="mark as not guessed"
                        onPress={() => togglePaper(paper, false)}
                      >
                        X
                      </Button>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ marginTop: '4rem' }}>More luck next time...</Text>
              )}
              {!!papersTurn.passed.length && (
                <Button
                  style={Styles.tscore.btnToggle}
                  onPress={() => togglePassedPapers(bool => !bool)}
                  variant="flat"
                >
                  {isVisiblePassedPapers ? 'Hide' : 'Show'} the papers you didn't get
                </Button>
              )}
              {isVisiblePassedPapers && !!papersTurn.passed.length && (
                <View style={Styles.tscore.list}>
                  {papersTurn.passed.map((paper, i) => (
                    <View style={Styles.tscore.item} key={`${i}_${paper}`}>
                      <Text>{paper}</Text>
                      <Button
                        style={Styles.tscore.btn('add')}
                        variant="icon"
                        aria-label="mark as guessed"
                        onPress={() => togglePaper(paper, true)}
                      >
                        +
                      </Button>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Page.Main>
        <Page.CTAs>
          <Button onPress={handleFinishTurnClick}>Finish my turn</Button>
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
        <Page.Main style={Styles.tscore.main}>
          <Text style={Styles.tscore.headerKicker}>Round {roundIndex + 1} finished!</Text>
          <Text style={Theme.typography.h1}>
            {myTeamWon ? (
              <Text style={{ color: Theme.colors.success }}>Your team won!</Text>
            ) : (
              <Text style={{ color: Theme.colors.danger }}>Your team lost!</Text>
            )}
          </Text>
          <View>
            <Text>Scores:</Text>
            {Object.keys(teamsScore).map(teamId => (
              <Text key={teamId}>
                {game.teams[teamId].name}: {teamsScore[teamId]}
              </Text>
            ))}
          </View>
        </Page.Main>
        <Page.CTAs>
          {round.current + 1 === game.settings.roundsCount ? (
            <Button onPress={handleFinalWinnerClick}>Show final winner!</Button>
          ) : profileIsAdmin ? (
            <Button onPress={handleStartNextRoundClick}>
              Start Round {round.current + 1 + 1} of {game.settings.roundsCount}
            </Button>
          ) : (
            <Text style={{ textAlign: 'center' }}>
              Wait for admin ({game.players[game.creatorId].name}) to start next round.
            </Text>
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
          <Text style={[Styles.count321, { marginTop: 100 /*20vh*/ }]}>
            {countdownSec - initialTimerSec}...
          </Text>
        </Page.Main>
      );
    }

    return (
      <Fragment>
        <Page.Main>
          <Button
            variant="success"
            style={[isPaperChanging && Styles.go.ctaDim]}
            onPress={() => handlePaperClick(true)}
          >
            Got it!
          </Button>
          <View style={Styles.go.main}>
            <Text
              style={[
                Styles.count321,
                Styles.go.count,
                { marginTop: '3.2rem', color: countdown <= 10500 && Theme.colors.danger },
              ]}
            >
              {msToSecPretty(countdown)}
            </Text>
            <View
              style={[Styles.go.paper, Styles.go[paperAnim]]}
              onMouseDown={() => setPaperBlur(false)}
              onTouchStart={() => setPaperBlur(false)}
              onMouseUp={() => setPaperBlur(true)}
              onTouchEnd={() => setPaperBlur(true)}
            >
              <Text
                style={[
                  Styles.go.paperWord,
                  isPaperBlur && Styles.go.blur,
                  paperAnim === 'gotcha' && Styles.go.paperWordInsideGotch,
                ]}
              >
                {papersTurn.current}
              </Text>
              <Text style={Styles.go.tipBlur} aria-hidden="true">
                {isPaperBlur && !isPaperChanging && 'Press to reveal'}
              </Text>
            </View>
          </View>
          <View
            hidden
            style={
              [
                /*Theme.typography.small*/
              ]
            }
          >
            <Text>
              {' '}
              {'\n'} - passed: {papersTurn.passed.join(', ')}{' '}
            </Text>
            <Text>
              {' '}
              {'\n'} - guessed: {papersTurn.guessed.join(', ')}{' '}
            </Text>
            <Text>
              {' '}
              {'\n'} - wordsLeft: {papersTurn.wordsLeft.join(', ')}{' '}
            </Text>
          </View>
        </Page.Main>
        <Page.CTAs>
          {papersTurn.current && !papersTurn.wordsLeft.length && !papersTurn.passed.length ? (
            <Text style={{ textAlign: 'center', color: Theme.colors.grayMedium }}>Last paper!</Text>
          ) : (
            <Button
              variant="light"
              style={[isPaperChanging && Styles.go.ctaDim]}
              onPress={() => handlePaperClick(false)}
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
    const player = profiles[turnPlayerId] || { avatar: null, name: `? ${turnPlayerId} ?` };

    return (
      <Fragment>
        <Page.Main>
          <View style={Styles.to.wrapper}>
            <View style={Styles.header}>
              <Text style={Styles.headerTitle}>Round {roundIndex + 1}</Text>
              <Text style={Theme.typography.secondary}>
                Try to guess as many papers as possible in 1 minute. {DESCRIPTIONS[roundIndex]}
              </Text>
            </View>
            <View style={Styles.to.main}>
              <Text style={Theme.typography.secondary}>
                {!hasCountdownStarted
                  ? 'Not started yet'
                  : countdownSec
                  ? 'The pressure is on!'
                  : 'Times up!'}
              </Text>
              <Text
                style={[
                  Theme.typography.h1,
                  {
                    color:
                      hasCountdownStarted && countdown <= 10500
                        ? Theme.colors.danger
                        : Theme.colors.primary,
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
              </Text>
            </View>
          </View>
        </Page.Main>
        <Page.CTAs>
          <View style={Styles.tos.container}>
            <Text style={[Styles.tos.title, Theme.typography.h3]}>Playing now</Text>
            <Avatar style={Styles.tos.avatar} hasMargin size="lg" src={player.avatar}></Avatar>
            <Text>Turn {round.turnCount + 1}</Text>
            <Text style={[Styles.tos.name, Theme.typography.h3]}>{player.name}</Text>
            <Text style={[Styles.tos.team, Theme.typography.secondary]}>Team "{teamName}"</Text>
          </View>
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

    // REVIEW this DESCRIPTIONS
    const scores = DESCRIPTIONS.map((desc, index) => getRoundScore(index));

    const getFinalWinner = () => {
      const arrayOfScores = Object.values(teamsTotalScore);
      const arrayOfTeamsId = Object.keys(teamsTotalScore);
      const winnerScore = Math.max(...arrayOfScores);
      const winnerIndex = arrayOfScores.indexOf(winnerScore);
      const winnerId = arrayOfTeamsId[winnerIndex];
      const myTeamWon = myTeamId === winnerId;

      return (
        <Text style={[Theme.typography.h1, { textAlign: 'center' }]}>
          {myTeamWon ? (
            <Text style={{ color: Theme.colors.success }}>You won! 🎉</Text>
          ) : (
            <Text style={{ color: Theme.colors.danger }}>You lost... 💩</Text>
          )}
        </Text>
      );
    };

    return (
      <Page>
        <Page.Main>
          {getFinalWinner()}
          <Text>{'\n'}</Text>
          {scores.map((round, index) => {
            return (
              <Fragment key={index}>
                <Text>Round {index}:</Text>
                <View>
                  {Object.keys(round.arrayOfTeamsId).map((teamId, index) => (
                    <Text key={teamId}>
                      {game.teams[teamId].name}: {round.arrayOfScores[index]}
                    </Text>
                  ))}
                </View>
                <Text>
                  {/* REVIEW - Show name even after member leaves game. */}
                  Best Player: {profiles[round.bestPlayer.id]?.name} ({round.bestPlayer.score})
                </Text>
                <Text>{'\n'}</Text>
              </Fragment>
            );
          })}
        </Page.Main>
        <Page.CTAs>
          <Button onPress={Papers.leaveGame}>Leave game</Button>
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
