/**
 * This code is the perfect definition of "just make it work".
 */
import React, { Fragment } from 'react';
import { Dimensions, ScrollView, View, TouchableHighlight, Animated, Text } from 'react-native';

import { useCountdown, usePrevious, getRandomInt, msToSecPretty } from '@constants/utils';
import PapersContext from '@store/PapersContext.js';

import Button from '@components/button';
import Page from '@components/page';
import Avatar from '@components/avatar';
import i18n from '@constants/i18n';

import * as Theme from '@theme';
import Styles from './PlayingStyles.js';

const ANIM_PAPER_NEXT = 500;

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc];

export default function Playing(props) {
  const Papers = React.useContext(PapersContext);
  const { profile, profiles, game } = Papers.state;
  const round = game.round;
  // const hasStatusGetReady = round.status === 'getReady';
  const hasStatusFinished = round.status === 'finished';
  const hasCountdownStarted = !['getReady', 'finished'].includes(round.status);
  const prevHasCountdownStarted = usePrevious(hasCountdownStarted);
  const profileIsAdmin = game.creatorId === profile.id;
  const initialTimer = 60000; // game.settings.time_ms;
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
  const { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd } = round?.turnWho || {};
  const turnPlayerId = game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex];
  const isMyTurn = turnPlayerId === profile.id;

  const [papersTurn, setPapersTurn] = React.useState(null);

  // const [isVisiblePassedPapers, togglePassedPapers] = React.useState(false);
  const [paperAnim, setPaperAnimation] = React.useState(null); // gotcha || nope
  const [isPaperBlur, setPaperBlur] = React.useState(false);
  const [isPaperChanging, setIsPaperChanging] = React.useState(false);
  const blurTimeout = React.useRef();
  const papersTurnCurrent = papersTurn?.current;
  const isCount321go = countdownSec > initialTimerSec;

  React.useEffect(() => {
    async function getTurnState() {
      // Turn this into a custom hook.
      const turnState = await Papers.getTurnLocalState();
      setPapersTurn(turnState);
    }
    getTurnState();
  }, []);

  React.useEffect(() => {
    if (!isCount321go) {
      console.log('useEffect:: 1º blur paper');
      setPaperBlur(false);
      clearTimeout(blurTimeout.current);
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime);
    }
  }, [isCount321go]);

  React.useEffect(() => {
    if (papersTurnCurrent !== null && !isCount321go) {
      console.log('useEffect:: timeout blur paper');
      setPaperBlur(false);
      clearTimeout(blurTimeout.current);
      blurTimeout.current = setTimeout(() => setPaperBlur(true), blurTime);
    }
  }, [papersTurnCurrent, isCount321go]);

  React.useEffect(() => {
    // use false to avoid undefined on first render
    if (prevHasCountdownStarted === false && hasCountdownStarted) {
      console.log('useEffect:: hasCountdownStarted');
      pickFirstPaper();
      startCountdown(round.status);
    }
  }, [startCountdown, round.status, prevHasCountdownStarted, hasCountdownStarted]); // eslint-disable-line

  function getPaperByKey(key) {
    const paper = game.words._all[key];
    if (!paper) {
      console.warn(`key "${key}" does not match a paper!`);
    }
    return paper;
  }

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
      const wordIndex = !wordsEnded ? getRandomInt(wordsToPick.length - 1) : 0;
      let nextPaper = wordsEnded ? null : wordsToPick[wordIndex];

      if (!wordsEnded && nextPaper === null) {
        console.error('Ups nextPaper!', wordIndex, wordsToPick);
      }

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
            nextPaper = currentPaper; // REVIEW: Why did I do this line?
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
        console.log('wordsToPick:', wordsToPick);
        const wordIndex = wordsToPick.indexOf(paper);
        wordsToPick.splice(wordIndex, 1);

        // It means all papers were guessed before
        // and now there's a new paper to guess!
        if (countdown && !state.passed.length) {
          wordsModified.current = paper;
        } else {
          wordsModified.passed = [...state.passed, paper];
        }
        wordsModified.guessed = wordsToPick;
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

    setIsPaperChanging(true);
    setPaperAnimation(hasGuessed ? 'gotcha' : 'nope');
    setPaperBlur(false);
    clearTimeout(blurTimeout.current);

    setTimeout(() => {
      setPaperAnimation(null);
      setIsPaperChanging(false);
      pickNextPaper(hasGuessed);
    }, ANIM_PAPER_NEXT);
  }

  function handleStartClick() {
    Papers.startTurn();
  }

  function handleFinishTurnClick() {
    // TODO - add loading state.
    // setPapersTurn({}); should it be done here?
    Papers.finishTurn(papersTurn);
    // just to double check...
    setPaperBlur(false);
    setIsPaperChanging(false);
  }

  function handleStartNextRoundClick() {
    Papers.startNextRound();
  }

  if (!papersTurn) {
    return (
      <Text style={[Theme.typography.h3, Theme.u.center, { marginTop: 200 }]}>
        Loading... hold on! ⏳
      </Text>
    );
  }

  // ----------------

  const renderRoundScore = () => {
    const teamsTotalScore = {};
    let myTeamId = null;

    // TODO URGENT . Make this prettier...
    // This is the perfect definition of 🍝 code.
    const getRoundScore = roundIndex => {
      const teamsPlayersScore = {};
      const scorePlayers = game.score[roundIndex];
      const teamsScore = {};
      let bestPlayer = {};

      if (scorePlayers) {
        Object.keys(game.teams).forEach(teamId => {
          game.teams[teamId].players.forEach(playerId => {
            myTeamId = myTeamId || (playerId === profile.id ? teamId : null);
            const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0;
            if (playerScore > (bestPlayer.score || 0)) {
              bestPlayer = {
                id: playerId,
                name: profiles[playerId].name,
                score: playerScore,
              };
            }
            teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore;

            if (!teamsPlayersScore[teamId]) {
              teamsPlayersScore[teamId] = [];
            }

            teamsPlayersScore[teamId].push({
              id: playerId,
              name: profiles[playerId].name,
              score: playerScore,
            });
          });

          teamsTotalScore[teamId] = (teamsTotalScore[teamId] || 0) + teamsScore[teamId];
        });
      }

      const arrayOfScores = Object.values(teamsScore);
      const arrayOfTeamsId = Object.keys(teamsScore);
      // const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
      // const winnerId = arrayOfTeamsId[winnerIndex];

      return {
        arrayOfScores,
        arrayOfTeamsId,
        bestPlayer,
        teamsScore,
        teamsPlayersScore,
      };
    };

    // REVIEW this DESCRIPTIONS usage...
    const scores = DESCRIPTIONS.map((desc, index) => getRoundScore(index));

    const arrayOfScores = Object.values(teamsTotalScore);
    const arrayOfTeamsId = Object.keys(teamsTotalScore);
    const winnerScore = Math.max(...arrayOfScores);
    const winnerIndex = arrayOfScores.indexOf(winnerScore);
    const winnerId = arrayOfTeamsId[winnerIndex];
    const myTeamWon = myTeamId === winnerId;

    const title = myTeamWon ? 'You won! 🎉' : 'You lost 💩';
    const description = myTeamWon ? 'They never stood a change' : 'Yikes.';
    const isFinalRound = roundIndex === game.settings.roundsCount - 1;

    const sortTeamIdByScore = (teamAId, teamBId) => arrayOfScores[teamBId] - arrayOfScores[teamAId];

    return (
      <Fragment>
        {isFinalRound && <EmojiRain type={myTeamWon ? 'winner' : 'loser'} />}
        <Page.Main>
          <View style={[Styles.header, { marginBottom: 16 }]}>
            {!isFinalRound ? (
              <Fragment>
                <Text style={Theme.typography.h3}>End of round {roundIndex + 1}</Text>
                <Text style={Theme.typography.h2}>
                  {myTeamWon ? (
                    <Text style={{ color: Theme.colors.success }}>Your team won!</Text>
                  ) : (
                    <Text style={{ color: Theme.colors.danger }}>Your team lost!</Text>
                  )}
                </Text>
              </Fragment>
            ) : (
              <Fragment>
                <Text style={Theme.typography.h1}>{title}</Text>
                <Text style={Theme.typography.body}>{description}</Text>
              </Fragment>
            )}
          </View>
          <View>
            {scores[roundIndex].arrayOfTeamsId.sort(sortTeamIdByScore).map((teamId, index) => {
              let bestPlayer;
              // it hurts omgosh...
              if (isFinalRound) {
                // Join all scores for each round in the team.
                // Memo is welcome!
                const thisTeamPlayersTotalScore = {};
                scores.forEach(round => {
                  round.teamsPlayersScore[teamId].forEach(player => {
                    if (!thisTeamPlayersTotalScore[player.id]) {
                      thisTeamPlayersTotalScore[player.id] = 0;
                    }
                    thisTeamPlayersTotalScore[player.id] += player.score;
                  });
                });
                const highestScore = Math.max(
                  ...Object.keys(thisTeamPlayersTotalScore).map(id => thisTeamPlayersTotalScore[id])
                );
                const bestPlayerId = Object.keys(thisTeamPlayersTotalScore).find(
                  id => thisTeamPlayersTotalScore[id] === highestScore
                );
                bestPlayer = { name: profiles[bestPlayerId].name, score: highestScore };
              } else {
                const thisTeamPlayersScore = scores[roundIndex].teamsPlayersScore[teamId];
                const highestScore = Math.max(...thisTeamPlayersScore.map(p => p.score));
                bestPlayer = thisTeamPlayersScore.find(p => p.score === highestScore);
              }
              return (
                <CardScore
                  key={teamId}
                  index={index}
                  teamName={game.teams[teamId].name}
                  bestPlayer={bestPlayer}
                  scoreTotal={teamsTotalScore[teamId]}
                  scoreRound={scores[roundIndex].teamsScore[teamId]}
                />
              );
            })}
          </View>
        </Page.Main>
        <Page.CTAs>
          {isFinalRound ? (
            <Button onPress={Papers.leaveGame}>Go to homepage</Button>
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

  // -------- other stuff

  const isAllWordsGuessed = game.papersGuessed === game.round.wordsLeft?.length;

  // Some memo here would be nice.
  const turnStatus = (() => {
    const isTurnOn = !hasCountdownStarted || !!countdownSec; // aka: it isn't times up
    // Ai jasus...
    const { 0: teamIx, 1: tPlayerIx, 2: tisOdd } = isTurnOn
      ? { 0: turnTeamIndex, 1: turnPlayerIndex, 2: isOdd }
      : Papers.getNextTurn();
    const tPlayerId = game.teams[teamIx].players[tisOdd ? 0 : tPlayerIx];

    return {
      title: isTurnOn ? 'Playing now' : 'Next up!',
      player: {
        name: tPlayerId === profile.id ? 'You!' : profiles[tPlayerId]?.name || `? ${tPlayerId} ?`,
        avatar: profiles[tPlayerId]?.avatar,
      },
      teamName: game.teams[teamIx].name,
    };
  })();

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
            isOdd={isOdd}
          />
        ) : (
          <MyTurnGo
            papersTurn={papersTurn}
            // --
            initialTimerSec={initialTimerSec}
            countdown={countdown}
            countdownSec={countdownSec}
            isCount321go={isCount321go}
            // --
            togglePaper={togglePaper}
            handleFinishTurnClick={handleFinishTurnClick}
            getPaperByKey={getPaperByKey}
            setPaperBlur={setPaperBlur}
            // --
            paperAnim={paperAnim}
            isPaperBlur={isPaperBlur}
            papersTurnCurrent={papersTurnCurrent}
            isPaperChanging={isPaperChanging}
            handlePaperClick={handlePaperClick}
          />
        )
      ) : (
        <OthersTurn
          description={DESCRIPTIONS[roundIndex]}
          thisTurnPlayer={profiles[game.teams[turnTeamIndex].players[isOdd ? 0 : turnPlayerIndex]]}
          turnStatus={turnStatus}
          hasCountdownStarted={hasCountdownStarted}
          countdownSec={countdownSec}
          countdown={countdown}
          isAllWordsGuessed={isAllWordsGuessed}
          initialTimerSec={initialTimerSec}
          initialTimer={initialTimer}
          roundIndex={roundIndex}
          papersGuessed={game.papersGuessed}
        />
      )}
    </Page>
  );
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * *\
|*                    COMPONENTS                       *|
|*       All in the same file because I say so.        *|
\* * * * * * * * * * * * * * * * * * * * * * * * * * * */

const MyTurnGetReady = ({ description, onStartClick, isOdd }) => (
  <Fragment>
    <Page.Main>
      <View style={Styles.header}>
        <Text style={Theme.typography.h1}>It's your turn!</Text>
        <Text style={[Theme.typography.secondary, Theme.u.center]}>
          {'\n'}
          Try to guess as many papers as possible in 1 minute. {description}
        </Text>

        <Text style={Theme.typography.primary}>
          {'\n'}
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

const MyTurnGo = ({
  papersTurn,
  countdownSec,
  togglePaper,
  handleFinishTurnClick,
  getPaperByKey,
  isCount321go,
  initialTimerSec,
  countdown,
  setPaperBlur,
  paperAnim,
  isPaperBlur,
  papersTurnCurrent,
  isPaperChanging,
  handlePaperClick,
}) => {
  const [isDone, setIsDone] = React.useState(false); // nowords || timesup
  const stillHasWords =
    papersTurnCurrent !== null || papersTurn.passed.length > 0 || papersTurn.wordsLeft.length > 0;
  const doneMsg = !stillHasWords ? 'All papers guessed!' : "Time's up!";
  const prevCountdownSec = usePrevious(countdownSec);

  React.useLayoutEffect(() => {
    // Use prevCountdownSec to avoid a false positive
    // when the component mounts (3, 2, 1...)
    if (countdownSec === 0 && !!prevCountdownSec) {
      setIsDone(true);
      setTimeout(resetIsDone, 1500);
    }
  }, [countdownSec, prevCountdownSec]);

  React.useLayoutEffect(() => {
    if (!stillHasWords) {
      setIsDone(true);
      setTimeout(resetIsDone, 1500);
    }
  }, [stillHasWords]);

  function resetIsDone() {
    setIsDone(false);
  }

  if (isDone) {
    return (
      <Page.Main>
        <Text style={[Theme.typography.h1, Styles.go_count321, { color: Theme.colors.danger }]}>
          {msToSecPretty(countdown)}
        </Text>
        <Text style={[Theme.typography.h1, Styles.go_done_msg]}>{doneMsg}</Text>
      </Page.Main>
    );
  }

  if (!isDone && (!stillHasWords || countdownSec === 0)) {
    return (
      <TurnScore
        papersTurn={papersTurn}
        onTogglePaper={togglePaper}
        type={!stillHasWords ? 'nowords' : 'timesup'}
        onFinish={handleFinishTurnClick}
        getPaperByKey={getPaperByKey}
      />
    );
  }

  if (isCount321go) {
    return (
      <Page.Main>
        <Text style={[Styles.go_count321, Theme.typography.h1]}>
          {countdownSec - initialTimerSec}
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
          {/* display paper */}
          <TouchableHighlight
            onPressIn={() => setPaperBlur(false)}
            onPressOut={() => setPaperBlur(true)}
          >
            <View style={[Styles.go_paper, Styles[`go_paper_${paperAnim}`]]}>
              <Text
                style={[
                  Theme.typography.h2,
                  Styles.go_paper_word,
                  isPaperBlur && Styles.go_paper_blur,
                  Styles[`go_paper_word_${paperAnim}`],
                ]}
              >
                {!isPaperBlur
                  ? getPaperByKey(papersTurnCurrent) ||
                    `😱 BUG PAPER 😱 ${papersTurnCurrent} (Click pass)`
                  : `*****`}
              </Text>
              <Text style={Styles.go_paper_key}>{String(papersTurnCurrent)}</Text>
              {isPaperBlur && !isPaperChanging && (
                <Text style={Theme.typography.small}>Press to reveal</Text>
              )}
            </View>
          </TouchableHighlight>
        </View>
        {/* words debug on */}
        <View style={{ display: 'block' }}>
          <Text style={{ fontSize: 10, lineHeight: 10 }}>
            {'\n'} - passed: {papersTurn.passed.join(', ')} {'\n'} - guessed:{' '}
            {papersTurn.guessed.join(', ')} {'\n'} - wordsLeft: {papersTurn.wordsLeft.join(', ')}{' '}
          </Text>
        </View>
      </Page.Main>

      <Page.CTAs hasOffset style={Styles.go_ctas}>
        {!isPaperChanging ? (
          <Fragment>
            <Button
              variant="success"
              styleTouch={{ flex: 1 }}
              onPress={() => handlePaperClick(true)}
            >
              Got it!
            </Button>
            <Text style={{ width: 16 }}>{/* lazyness lvl 99 */}</Text>

            {papersTurn.current !== null &&
            !papersTurn.wordsLeft.length &&
            !papersTurn.passed.length ? (
              <Text
                style={[
                  { flex: 1, textAlign: 'center' },
                  Theme.typography.secondary,
                  Theme.u.center,
                ]}
              >
                Last paper!
              </Text>
            ) : (
              <Button
                variant="primary"
                styleTouch={{ flex: 1 }}
                onPress={() => handlePaperClick(false)}
              >
                Pass paper
              </Button>
            )}
          </Fragment>
        ) : (
          <Text style={[Theme.u.center, { flex: 1, lineHeight: 44 }]}>⏳</Text>
        )}
      </Page.CTAs>
    </Fragment>
  );
};

const OthersTurn = ({
  description,
  hasCountdownStarted,
  roundIndex,
  countdownSec,
  countdown,
  initialTimerSec,
  initialTimer,
  thisTurnPlayer,
  turnStatus,
  papersGuessed,
  isAllWordsGuessed,
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
            ) : countdownSec && !isAllWordsGuessed ? null : (
              <Fragment>
                <Text style={[Theme.typography.small]}>
                  {isAllWordsGuessed ? 'All papers guessed!' : "Time's up!"}
                </Text>
                <Text style={[Theme.typography.h1, Theme.u.center]}>
                  {thisTurnPlayer.name} got {papersGuessed} papers right!
                </Text>
              </Fragment>
            )}
            <Text
              style={[
                Theme.typography.h1,
                {
                  marginVertical: 8,
                  color: hasCountdownStarted
                    ? countdown <= 10500
                      ? Theme.colors.danger
                      : Theme.colors.primary
                    : Theme.colors.grayDark,
                },
              ]}
            >
              {hasCountdownStarted
                ? countdownSec > initialTimerSec // isCount321go
                  ? countdownSec - initialTimerSec // 3, 2, 1...
                  : countdownSec && !isAllWordsGuessed
                  ? msToSecPretty(countdown) // 59, 58, counting...
                  : '' // timeout or all words guessed
                : msToSecPretty(initialTimer) // waiting to start
              }
            </Text>
            <Text style={Theme.typography.small}>{papersGuessed} papers guessed</Text>
          </View>
        </View>
      </Page.Main>
      <Page.CTAs>
        {isAllWordsGuessed ? (
          <View>
            <Text style={Theme.typography.h3}>End of Round {roundIndex}</Text>
            <Text style={[Theme.typography.body, { marginTop: 16 }]}>
              Waiting for {thisTurnPlayer.name} to finish their turn.
            </Text>
          </View>
        ) : (
          <TurnStatus
            title={turnStatus.title}
            player={turnStatus.player}
            teamName={turnStatus.teamName}
          />
        )}
      </Page.CTAs>
    </Fragment>
  );
};

const TurnStatus = ({ title, player, teamName }) => (
  <View style={Styles.tst}>
    <Text style={Theme.typography.h3}>{title}</Text>
    <View style={Styles.tst_flex}>
      <Avatar hasMargin size="lg" src={player.avatar} />
      <View>
        <Text style={Theme.typography.h3}>{player.name}</Text>
        <Text style={[Theme.typography.secondary, Styles.tst_team]}>Team "{teamName}"</Text>
      </View>
    </View>
  </View>
);

const TurnScore = ({ papersTurn, type, onTogglePaper, onFinish, getPaperByKey }) => {
  return (
    <Fragment>
      <Page.Main>
        <View style={Styles.header}>
          <Text style={Theme.typography.secondary}>
            {type === 'timesup' ? "Time's Up!" : 'All papers guessed!'}
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
                  <Text style={Theme.typography.body}>{getPaperByKey(paper)}</Text>
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
            <Text style={[Theme.typography.italic, Theme.u.center, { marginTop: 40 }]}>
              More luck next time...
            </Text>
          )}
          {!!papersTurn.passed.length && (
            <View style={Styles.tscore_list}>
              <Text style={Theme.typography.h3}>Papers you didn't get:</Text>
              {papersTurn.passed.map((paper, i) => (
                <View style={Styles.tscore_item} key={`${i}_${paper}`}>
                  <Text style={Theme.typography.body}>{getPaperByKey(paper)}</Text>
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
        {/* TODO add loading */}
        <Button onPress={onFinish}>Finish my turn</Button>
      </Page.CTAs>
    </Fragment>
  );
};

const placeMap = {
  0: '1st place',
  1: '2nd place',
  3: '3rd place', // REVIEW - Maximum 3 teams
};

const CardScore = ({ index, teamName, scoreTotal, scoreRound, bestPlayer }) => (
  <View style={Styles.fscore_item} key={index}>
    <View style={Styles.fscore_info}>
      <Text
        style={[
          Styles.fscore_tag,
          {
            backgroundColor: index === 0 ? Theme.colors.primary : Theme.colors.grayDark,
            marginBottom: 8,
          },
        ]}
      >
        {placeMap[index]}
      </Text>
      <Text style={Theme.typography.h3}>{teamName}</Text>
      <Text style={Theme.typography.small}>
        {bestPlayer.name} was the best player! ({bestPlayer.score})
      </Text>
    </View>
    <View style={Styles.fscore_score}>
      <Text style={Theme.typography.small}>Papers</Text>
      <Text style={Theme.typography.h1}>{scoreTotal}</Text>
      <Text style={Theme.typography.small}>+{scoreRound} this round</Text>
    </View>
  </View>
);

const EmojiRain = ({ type }) => {
  const emojis = type === 'winner' ? ['🎉', '🔥', '💖', '😃'] : ['🤡', '💩', '👎', '😓'];
  const count = Array.from(Array(20), () => 1);
  // const [fadeAnim] = React.useState(new Animated.Value(0)); // Initial value for opacity: 0
  // const [rainAnim] = React.useState(new Animated.Value(0)); // Initial value for opacity: 0

  const vw = Dimensions.get('window').width / 100;
  const vh = Dimensions.get('window').height / 100;
  const col = 5;

  // TODO animations.
  // React.useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1000,
  //   }).start();

  //   Animated.timing(rainAnim, {
  //     toValue: vh * 100,
  //     duration: 5000,
  //   }).start();
  // }, []);

  return (
    <View pointerEvents="none" style={{ zIndex: 2 }}>
      <Animated.View
        style={{
          position: 'relative',
          // opacity: fadeAnim,
        }}
      >
        {count.map((x, index) => (
          <Text
            key={index}
            style={{
              fontSize: 18,
              position: 'absolute',
              left: ((index % col) * 20 + (Math.floor(index / col) % 2 ? 10 : 0)) * vh,
              top: (Math.floor(index / col) * 15 + (index * 1.5 + 70)) * vh,
            }}
          >
            {emojis[index % 4]}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
};