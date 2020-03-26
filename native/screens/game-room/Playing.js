import React, { Fragment } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';

import { useCountdown, usePrevious, getRandomInt, msToSecPretty } from '@constants/utils';
import PapersContext from '@store/PapersContext.js';

import Button from '@components/button';
import Page from '@components/page';
import Avatar from '@components/avatar';

import * as Theme from '@theme';
import Styles from './PlayingStyles.js';

const OldStyles = {
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

const ANIM_PAPER_NEXT = 999;

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
  const initialTimer = 60000000; // TODO - from Papers.settings?
  const timerReady = 3400;
  const [countdown, startCountdown] = useCountdown(hasCountdownStarted ? round.status : null, {
    timer: initialTimer + timerReady, // 400 - threshold for io connection.
  }); // 3,2,1... go!
  const initialTimerSec = Math.round(initialTimer / 1000);
  const countdownSec = Math.round(countdown / 1000);
  const blurTime = 1500; // TODO - game individual setting
  // const prevCountdownSec = usePrevious(countdownSec);
  // const [timesUp, setTimesup] = React.useState(false);

  const roundIndex = round.current;
  const { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd } = round.turnWho;
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  const [papersTurn, setPapersTurn] = React.useState(null);
  const [isFinalScore, setFinalScore] = React.useState(null);

  const [isVisiblePassedPapers, togglePassedPapers] = React.useState(false);
  const [paperAnim, setPaperAnimation] = React.useState(null); // gotcha || nope
  const [isPaperBlur, setPaperBlur] = React.useState(hasCountdownStarted);
  const [isPaperChanging, setIsPaperChanging] = React.useState(false);

  React.useEffect(() => {
    async function getTurnState() {
      // Turn this into a custom hook.
      const turnState = await Papers.getTurnLocalState();
      setPapersTurn(turnState);
    }
    getTurnState();
  }, []);

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
        Papers.setTurnLocalState(state);
        return state;
      }

      const wordsToPick = [...state.wordsLeft];

      const wordIndex = getRandomInt(wordsToPick.length - 1);
      const nextPaper = wordsToPick[wordIndex];

      wordsToPick.splice(wordIndex, 1);

      state.current = nextPaper;
      state.wordsLeft = wordsToPick;

      Papers.setTurnLocalState(state);
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

      Papers.setTurnLocalState(newState);
      return newState;
    });
    setPaperBlur(false);
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

      Papers.setTurnLocalState(newState);
      return newState;
    });
  }

  function handlePaperClick(hasGuessed) {
    if (isPaperChanging) {
      return;
    }
    // TODO / BUG clear all timeouts around...
    setPaperBlur(false);
    setIsPaperChanging(true);
    setPaperAnimation(hasGuessed ? 'gotcha' : 'nope');

    setTimeout(() => {
      setPaperAnimation(null);
      pickNextPaper(hasGuessed);
      // TODO - animations in react native?
      setTimeout(() => setIsPaperChanging(false), ANIM_PAPER_NEXT / 2);
      setTimeout(() => setPaperBlur(true), blurTime);
    }, ANIM_PAPER_NEXT);
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

  if (!papersTurn) {
    return (
      <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 200 }]}>
        Hold on... it's loading!
      </Text>
    );
  }

  // ----------------

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
        <Page.Main>
          <View style={Styles.header}>
            <Text style={Theme.typography.h3}>End of round {roundIndex + 1}</Text>
            <Text style={Theme.typography.h2}>
              {myTeamWon ? (
                <Text style={{ color: Theme.colors.success }}>Your team won!</Text>
              ) : (
                <Text style={{ color: Theme.colors.danger }}>Your team lost!</Text>
              )}
            </Text>

            <View>
              <Text>
                {Object.keys(teamsScore).map(teamId => (
                  <Text key={teamId}>
                    {game.teams[teamId].name}: {teamsScore[teamId]};
                  </Text>
                ))}
              </Text>
            </View>
          </View>
        </Page.Main>
        <Page.CTAs>
          {round.current + 1 === game.settings.roundsCount ? (
            <Button onPress={handleFinalWinnerClick}>Show final winner!</Button>
          ) : profileIsAdmin ? (
            <Button onPress={handleStartNextRoundClick}>
              Start Round {round.current + 1 + 1} of {game.settings.roundsCount}!
            </Button>
          ) : (
            <Text style={[Theme.typography.italic, Theme.u.center]}>
              Wait for {game.players[game.creatorId].name} (admin) to start next round.
            </Text>
          )}
        </Page.CTAs>
      </Fragment>
    );
  };

  const renderGo = () => {
    const stillHasWords =
      papersTurn.current || papersTurn.passed.length > 0 || papersTurn.wordsLeft.length > 0;
    const turnScoreProps = {
      onFinish: handleFinishTurnClick,
    };

    if (!stillHasWords || countdownSec === 0) {
      const type = !stillHasWords ? 'nowords' : 'timesup';
      return (
        <TurnScore
          papersTurn={papersTurn}
          onTogglePaper={togglePaper}
          type={type}
          onFinish={handleFinishTurnClick}
        />
      );
    }

    // if (countdownSec === 0) {
    //   return <TurnScore type='timesup' { ...turnScoreProps } />;
    // }

    if (countdownSec > initialTimerSec) {
      return (
        <Page.Main>
          <Text style={[Styles.go_count321, Theme.typography.h1]}>
            {countdownSec - initialTimerSec}...
          </Text>
        </Page.Main>
      );
    }

    return (
      <Fragment>
        <Page.Main>
          <View>
            <Text
              style={[
                Theme.typography.h1,
                Styles.go_count321,
                countdown <= 10500 && { color: Theme.colors.danger },
              ]}
            >
              {msToSecPretty(countdown)}
            </Text>
            <View
              style={[Styles.go_paper, Styles[`go_paper_${paperAnim}`]]}
              onMouseDown={() => setPaperBlur(false)}
              onTouchStart={() => setPaperBlur(false)}
              onMouseUp={() => setPaperBlur(true)}
              onTouchEnd={() => setPaperBlur(true)}
            >
              <Text
                style={[
                  Theme.typography.h2,
                  Styles.go_paper_word,
                  isPaperBlur && Styles.go_paper_blur,
                  Styles[`go_paper_word_${paperAnim}`],
                ]}
              >
                {/* this will happen until local storage is fixed */}
                {!isPaperBlur ? papersTurn.current || '😱 LOST PAPER 😱 (Click pass)' : '*****'}
              </Text>
              {isPaperBlur && !isPaperChanging && (
                <Text style={Theme.typography.small}>Press to reveal</Text>
              )}
            </View>
          </View>
          <View style={{ display: 'block' }}>
            <Text style={{ fontSize: 10, lineHeight: 10 }}>
              {'\n'} - passed: {papersTurn.passed.join(', ')} {'\n'} - guessed:{' '}
              {papersTurn.guessed.join(', ')} {'\n'} - wordsLeft: {papersTurn.wordsLeft.join(', ')}{' '}
            </Text>
          </View>
        </Page.Main>
        <Page.CTAs style={Styles.go_ctas}>
          <Button
            variant="success"
            disabled={isPaperChanging}
            styleTouch={[{ flex: 1 }, isPaperChanging && Styles.go_cta_dim]}
            onPress={() => handlePaperClick(true)}
          >
            Got it!
          </Button>
          <Text style={{ width: 24 }}>{/* lazyness lvl 99 */}</Text>
          {papersTurn.current && !papersTurn.wordsLeft.length && !papersTurn.passed.length ? (
            <Text
              style={[{ flex: 1, textAlign: 'center' }, Theme.typography.secondary, Theme.u.center]}
            >
              Last paper!
            </Text>
          ) : (
            <Button
              variant="light"
              disabled={isPaperChanging}
              styleTouch={[{ flex: 1 }, isPaperChanging && Styles.go_cta_dim]}
              onPress={() => handlePaperClick(false)}
            >
              Pass paper
            </Button>
          )}
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
      {hasStatusFinished ? (
        renderRoundScore()
      ) : isMyTurn ? (
        !hasCountdownStarted ? (
          <MyTurnGetReady
            description={DESCRIPTIONS[roundIndex]}
            onStartClick={handleStartClick}
            isOdd
          />
        ) : (
          renderGo()
        )
      ) : (
        <OthersTurn
          description={DESCRIPTIONS[roundIndex]}
          teamName={game.teams[turnTeamIndex].name}
          player={profiles[turnPlayerId] || { avatar: null, name: `? ${turnPlayerId} ?` }}
          hasCountdownStarted={hasCountdownStarted}
          countdownSec={countdownSec}
          countdown={countdown}
          initialTimerSec={initialTimerSec}
          initialTimer={initialTimer}
          roundIndex={roundIndex}
        />
      )}
    </Page>
  );
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * *\
|*                    COMPONENTS                       *|
|*       All in the same file because I say it.        *|
\* * * * * * * * * * * * * * * * * * * * * * * * * * * */

const MyTurnGetReady = ({ description, onStartClick, isOdd }) => (
  <Fragment>
    <Page.Main>
      <View style={Styles.header}>
        <Text style={Theme.typography.h1}>It's your turn!</Text>
        <Text style={Theme.typography.secondary}>
          {'\n'}
          Try to guess as many papers as possible in 1 minute. {description}
        </Text>

        <Text style={Theme.typography.primary}>
          Click <Text style={{ color: Theme.colors.primary, fontWeight: 'bold' }}>"PASS"</Text> to
          go to the next paper. Don’t worry, you can always go back!
          {'\n'}
          {'\n'}
          Click <Text style={{ color: Theme.colors.success, fontWeight: 'bold' }}>
            "GOT IT"{' '}
          </Text>{' '}
          if your team guesses the paper.
        </Text>
      </View>
      {isOdd && (
        <Text style={{ color: Theme.colors.danger }}>
          {'\n'}Your team has one player less, so it's you again.
        </Text>
      )}
    </Page.Main>
    <Page.CTAs>
      <Button onPress={onStartClick}>Start now!</Button>
    </Page.CTAs>
  </Fragment>
);

const OthersTurn = ({
  teamName,
  player,
  description,
  hasCountdownStarted,
  roundIndex,
  countdownSec,
  countdown,
  initialTimerSec,
  initialTimer,
}) => {
  return (
    <Fragment>
      <Page.Main>
        <View>
          <View style={Styles.header}>
            <Text style={Theme.typography.h3}>Round {roundIndex + 1}</Text>
            <Text style={[Theme.typography.secondary, Theme.u.center]}>
              {'\n'}
              Try to guess as many papers as possible in 1 minute. {description}
            </Text>
          </View>
          <View style={Styles.main}>
            {!hasCountdownStarted ? (
              <Text style={Theme.typography.small}>Not started yet</Text>
            ) : !!countdownSec ? (
              <Text style={Theme.typography.small}>The pressure is on!</Text>
            ) : (
              <Text style={[Theme.typography.small, Theme.u.text_danger]}>Times up!</Text>
            )}
            <Text
              style={[
                Theme.typography.h1,
                {
                  color: hasCountdownStarted
                    ? countdown <= 10500
                      ? Theme.colors.danger
                      : Theme.colors.primary
                    : Theme.colors.grayDark,
                },
              ]}
            >
              {hasCountdownStarted
                ? countdownSec > initialTimerSec
                  ? countdownSec - initialTimerSec + '...' // 3, 2, 1...
                  : countdownSec
                  ? msToSecPretty(countdown) // 59, 58, counting...
                  : '00:00' // timeout
                : msToSecPretty(initialTimer) // waiting to start
              }
            </Text>
          </View>
        </View>
      </Page.Main>
      <Page.CTAs>
        <View style={Styles.tst}>
          <Text style={Theme.typography.h3}>Playing now</Text>
          <View style={Styles.tst_flex}>
            <Avatar hasMargin size="lg" src={player.avatar} />
            <View>
              <Text style={Theme.typography.h3}>{player.name}</Text>
              <Text style={[Theme.typography.secondary, Styles.tst_team]}>Team "{teamName}"</Text>
            </View>
          </View>
        </View>
      </Page.CTAs>
    </Fragment>
  );
};

const TurnScore = ({ papersTurn, type, onTogglePaper, onFinish }) => {
  return (
    <Fragment>
      <Page.Main>
        <View style={Styles.header}>
          <Text style={Theme.typography.secondary}>
            {type === 'timesup' ? "Time's Up!" : 'All papers done!'}
          </Text>
          <Text style={[Theme.typography.h2, Theme.u.center]}>
            Your team got <Text>{papersTurn.guessed.length}</Text> papers right!
          </Text>
        </View>

        <ScrollView style={Theme.u.scrollSideOffset}>
          {papersTurn.guessed.length ? (
            <View style={Styles.tscore_list}>
              {papersTurn.guessed.map((paper, i) => (
                <View style={[Styles.tscore_item]} key={`${i}_${paper}`}>
                  <Text style={Theme.typography.body}>{paper}</Text>
                  <Button
                    style={Styles.tscore_btnRemove}
                    variant="flat"
                    onPress={() => onTogglePaper(paper, false)}
                  >
                    Remove
                  </Button>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[Theme.ypography.italic, { marginTop: '4rem' }]}>
              More luck next time...
            </Text>
          )}
          {/* {!!papersTurn.passed.length && (
            <Button
              style={Styles.tscore_btnToggle}
              onPress={() => togglePassedPapers(bool => !bool)}
              variant="flat"
            >
              {isVisiblePassedPapers ? 'Hide' : 'Show'} the papers you didn't get
            </Button>
          )} */}
          {/*isVisiblePassedPapers && */}
          {!!papersTurn.passed.length && (
            <View style={Styles.tscore_list}>
              <Text style={Theme.typography.h2}>Papers you didn't get:</Text>
              {papersTurn.passed.map((paper, i) => (
                <View style={Styles.tscore_item} key={`${i}_${paper}`}>
                  <Text>{paper}</Text>
                  <Button
                    style={Styles.tscore_btnAdd}
                    variant="flat"
                    onPress={() => onTogglePaper(paper, true)}
                  >
                    Add
                  </Button>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Page.Main>
      <Page.CTAs hasOffset>
        <Button onPress={onFinish}>Finish my turn</Button>
      </Page.CTAs>
    </Fragment>
  );
};
