import React, { Fragment } from 'react'
import { View, Text } from 'react-native'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import i18n from '@constants/i18n'

// import EmojiRain from './EmojiRain'
import { MyTurnGetReady, OthersTurn } from './index'
import CardScore from './CardScore'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc]

const RoundScore = () => {
  const Papers = React.useContext(PapersContext)
  const { profile, profiles, game } = Papers.state
  const round = game.round
  const roundIx = round.current

  const teamsTotalScore = {}
  let myTeamId = null

  // TODO URGENT. This is the perfect definition of 🍝 code.
  const getRoundScore = roundIx => {
    const teamsPlayersScore = {}
    const scorePlayers = game.score[roundIx]
    const teamsScore = {}
    let bestPlayer = {}

    if (scorePlayers) {
      Object.keys(game.teams).forEach(teamId => {
        game.teams[teamId].players.forEach(playerId => {
          myTeamId = myTeamId || (playerId === profile.id ? teamId : null)
          const playerScore = scorePlayers[playerId] ? scorePlayers[playerId].length : 0
          if (playerScore > (bestPlayer.score || 0)) {
            bestPlayer = {
              id: playerId,
              name: profiles[playerId]?.name,
              score: playerScore,
            }
          }
          teamsScore[teamId] = (teamsScore[teamId] || 0) + playerScore

          if (!teamsPlayersScore[teamId]) {
            teamsPlayersScore[teamId] = []
          }

          teamsPlayersScore[teamId].push({
            id: playerId,
            name: profiles[playerId]?.name,
            score: playerScore,
          })
        })

        teamsTotalScore[teamId] = (teamsTotalScore[teamId] || 0) + teamsScore[teamId]
      })
    }

    const arrayOfScores = Object.values(teamsScore)
    const arrayOfTeamsId = Object.keys(teamsScore)
    // const winnerIndex = arrayOfScores.indexOf(Math.max(...arrayOfScores));
    // const winnerId = arrayOfTeamsId[winnerIndex];

    return {
      arrayOfScores,
      arrayOfTeamsId,
      bestPlayer,
      teamsScore,
      teamsPlayersScore,
    }
  }

  // REVIEW this DESCRIPTIONS usage...
  const scores = DESCRIPTIONS.map((desc, index) => getRoundScore(index))

  const arrayOfScores = Object.values(teamsTotalScore)
  const arrayOfTeamsId = Object.keys(teamsTotalScore)
  const winnerScore = Math.max(...arrayOfScores)
  const winnerIndex = arrayOfScores.indexOf(winnerScore)
  const winnerId = arrayOfTeamsId[winnerIndex]
  const myTeamWon = myTeamId === winnerId
  const isTie = arrayOfScores[1] === arrayOfScores[0]
  const isFinalRound = roundIx === game.settings.roundsCount - 1
  const amIReady = game.players[profile.id].isReady

  const sortTeamIdByScore = (teamAId, teamBId) => arrayOfScores[teamBId] - arrayOfScores[teamAId]

  function handleReadyClick() {
    Papers.markMeAsReadyForNextRound()
  }

  if (amIReady) {
    // epah... i don't like this here, but couldn't find better.
    const nextTurnWho = Papers.getNextTurn()
    const nextRoundIx = round.current + 1
    const turnTeam = nextTurnWho.team
    const turnPlayerId = game.teams[turnTeam].players[nextTurnWho[turnTeam]]
    const turnPlayer = profiles[turnPlayerId]
    const isMyTurn = turnPlayerId === profile.id
    const initialTimer = game.settings.time_ms
    const initialTimerSec = Math.round(initialTimer / 1000)

    return (
      <Page.Main blankBg>
        {isMyTurn ? (
          <MyTurnGetReady
            description={DESCRIPTIONS[nextRoundIx]}
            roundIx={nextRoundIx}
            amIWaiting={true}
          />
        ) : (
          <OthersTurn
            description={DESCRIPTIONS[nextRoundIx]}
            thisTurnPlayerName={turnPlayer?.name || `? ${turnPlayer} ?`}
            hasCountdownStarted={false}
            countdownSec={initialTimerSec}
            countdown={initialTimer}
            initialTimerSec={initialTimerSec}
            initialTimer={initialTimer}
            amIWaiting={true}
          />
        )}
      </Page.Main>
    )
  }

  return (
    <Fragment>
      {/* {isFinalRound && <EmojiRain type={myTeamWon ? 'winner' : 'loser'} />} */}
      <Page.Main blankBg>
        <View style={[Styles.header, { marginBottom: 16 }]}>
          {isFinalRound ? (
            <Fragment>
              {/* <Text style={Theme.typography.h3}>End of round {roundIx + 1}</Text> */}
              <Text style={Theme.typography.h1}>
                {myTeamWon ? 'Your team won!' : 'Your team lost!'}
              </Text>
            </Fragment>
          ) : (
            <Fragment>
              <Text style={Theme.typography.h3}>
                {isTie
                  ? "It's a tie!"
                  : myTeamWon
                  ? 'Your team won this round!'
                  : 'Your team lost this round...'}
              </Text>
            </Fragment>
          )}
        </View>
        {/* TODO - Extract this to TeamsScore and use at Settings (score) */}
        <View>
          {scores[roundIx].arrayOfTeamsId.sort(sortTeamIdByScore).map((teamId, index) => {
            let bestPlayer
            // it hurts om gosh...
            if (isFinalRound) {
              // Join all scores for each round in the team.
              // Memo is welcome!
              const thisTeamPlayersTotalScore = {}
              scores.forEach(round => {
                round.teamsPlayersScore[teamId].forEach(player => {
                  if (!thisTeamPlayersTotalScore[player.id]) {
                    thisTeamPlayersTotalScore[player.id] = 0
                  }
                  thisTeamPlayersTotalScore[player.id] += player.score
                })
              })
              const highestScore = Math.max(
                ...Object.keys(thisTeamPlayersTotalScore).map(id => thisTeamPlayersTotalScore[id])
              )
              const bestPlayerId = Object.keys(thisTeamPlayersTotalScore).find(
                id => thisTeamPlayersTotalScore[id] === highestScore
              )
              bestPlayer = { name: profiles[bestPlayerId]?.name, score: highestScore }
            } else {
              const thisTeamPlayersScore = scores[roundIx].teamsPlayersScore[teamId]
              const highestScore = Math.max(...thisTeamPlayersScore.map(p => p.score))
              bestPlayer = thisTeamPlayersScore.find(p => p.score === highestScore)
            }
            return (
              <CardScore
                key={teamId}
                index={index}
                isTie={isTie}
                teamName={game.teams[teamId].name}
                bestPlayer={bestPlayer}
                scoreTotal={teamsTotalScore[teamId]}
                scoreRound={scores[roundIx].teamsScore[teamId]}
              />
            )
          })}
        </View>
      </Page.Main>
      <Page.CTAs blankBg>
        {isFinalRound ? (
          <Button onPress={Papers.leaveGame}>Go to homepage</Button>
        ) : (
          <Button onPress={handleReadyClick}>I'm ready for round {round.current + 1 + 1}!</Button>
        )}
      </Page.CTAs>
    </Fragment>
  )
}

export default RoundScore
