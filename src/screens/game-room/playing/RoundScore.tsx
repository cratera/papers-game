import React, { Fragment } from 'react'
import { ScrollView, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'

import Button from '@src/components/button'
import Page from '@src/components/page'
import { formatScores, getTeamId } from '@src/store/papersMethods'

import { headerTheme } from '@src/navigation/headerStuff'
// import EmojiRain from './EmojiRain'
import GameScore from '@src/components/game-score'

import { StackScreenProps } from '@react-navigation/stack'
import i18n from '@src/constants/i18n'
import { AppStackParamList } from '@src/navigation/navigation.types'
import * as Theme from '@src/theme'
import Styles from './Playing.styles'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc] // REVIEW this

const RoundScore = ({
  navigation,
}: Pick<StackScreenProps<AppStackParamList, 'playing'>, 'navigation'>) => {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const round = game?.round
  const roundIx = round?.current || 0
  const isFinalRound = roundIx === (game?.settings.roundsCount || 0) - 1
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isOnRoundIntro, setIsOnRoundIntro] = React.useState(false)

  const { isMyTeamWinner, isTie, scoreByRound, getPlayersSorted } = React.useMemo(
    () => formatScores(game?.score, game?.teams, profile?.id),
    [game?.score, game?.teams, profile?.id]
  )

  function getMyTotalScore() {
    if (!isFinalRound) return null

    const myTeamId = profile?.id && getTeamId(profile.id, game?.teams)
    const playersSorted = myTeamId && getPlayersSorted(myTeamId, roundIx, true)
    return (
      (typeof playersSorted === 'object' &&
        playersSorted.find((p) => p.id === profile?.id)?.score) ||
      0
    )
  }

  const myTotalScore = getMyTotalScore() || 0

  React.useEffect(() => {
    Papers.sendTracker('game_finishRound', {
      arrayOfScores: scoreByRound[roundIx]?.arrayOfScores || [],
      isMyTeamWinner,
      myTotalScore,
    })
  }, [Papers, isMyTeamWinner, myTotalScore, roundIx, scoreByRound])

  function handleStartRoundClick() {
    setIsOnRoundIntro(true)
    navigation.setOptions({
      ...headerTheme({ hiddenTitle: true }),
    })
  }

  async function handleReadyClick() {
    if (isSubmitting === true) {
      return
    }
    setIsSubmitting(true)

    try {
      await Papers.markMeAsReadyForNextRound()
    } catch (error) {
      // TODO: errorMsg
    }
  }

  if (isOnRoundIntro) {
    return (
      <Page bgFill="purple">
        <Page.Main>
          <View style={[Styles.header, Styles.header_roundScore]}>
            <Text style={[Theme.typography.h1, { color: Theme.colors.bg }]}>
              Round {roundIx + 1 + 1}
            </Text>
            <Text
              style={[Theme.typography.body, Theme.utils.center, Styles.description_roundScore]}
            >
              {DESCRIPTIONS[roundIx + 1]}
            </Text>
          </View>
        </Page.Main>
        <Page.CTAs>
          <Button place="float" isLoading={isSubmitting} onPress={handleReadyClick}>
            {`I'm ready!`}
          </Button>
        </Page.CTAs>
      </Page>
    )
  }

  return (
    <Page>
      {/* {!isTie && isFinalRound && <EmojiRain type={isMyTeamWinner ? 'winner' : 'loser'} />} */}
      <Page.Main>
        <View style={Styles.normal_round_container}>
          {isFinalRound ? (
            <Fragment>
              <Text style={[Theme.typography.h3, Theme.utils.center]}>
                {isTie ? 'Stalemate' : isMyTeamWinner ? 'Your team won!' : 'Your team lost'}
              </Text>
              <Text style={[Theme.typography.body, Theme.utils.center]}>
                {isTie
                  ? "It's a tie"
                  : isMyTeamWinner
                  ? '😎 They never stood a chance 😎'
                  : '💩 Yikes 💩'}
              </Text>
            </Fragment>
          ) : (
            <Fragment>
              <Text style={[Theme.typography.h3, Theme.utils.center]}>
                {isTie
                  ? "It's a tie!"
                  : isMyTeamWinner
                  ? 'Your team won this round!'
                  : 'Your team lost this round?...'}
              </Text>
            </Fragment>
          )}
        </View>
        <ScrollView
          style={Theme.utils.scrollSideOffset}
          contentContainerStyle={Theme.spacing.pb_120}
        >
          <GameScore BOAT={isFinalRound} />
        </ScrollView>
      </Page.Main>
      <Page.CTAs>
        {isFinalRound ? (
          <Button
            place="float"
            bgColor={Theme.colors.purple}
            onPress={() => {
              navigation.navigate('gate', { goal: 'leave' })
              Papers.leaveGame()
            }}
          >
            Go to homepage
          </Button>
        ) : (
          <Button
            place="float"
            bgColor={Theme.colors.purple}
            isLoading={isSubmitting}
            onPress={handleStartRoundClick}
          >
            {`Start round ${roundIx + 1 + 1}!`}
          </Button>
        )}
      </Page.CTAs>
    </Page>
  )
}

export default RoundScore
