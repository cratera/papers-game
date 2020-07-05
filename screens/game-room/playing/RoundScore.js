import React, { Fragment } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { useScores } from '@store/papersMethods'

import { headerTheme } from '@navigation/headerStuff.js'
import EmojiRain from './EmojiRain'
import GameScore from '@components/game-score'

import * as Theme from '@theme'
import Styles from './PlayingStyles.js'
import i18n from '@constants/i18n'

const DESCRIPTIONS = [i18n.round_0_desc, i18n.round_1_desc, i18n.round_2_desc] // REVIEW this

const RoundScore = ({ navigation }) => {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const round = game.round
  const roundIx = round.current
  const isFinalRound = roundIx === game.settings.roundsCount - 1
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isOnRoundIntro, setIsOnRoundIntro] = React.useState(false)

  const { isMyTeamWinner, isTie } = React.useMemo(
    () => useScores(game.score, game.teams, profile.id),
    []
  )

  // TODO next - continue hereee
  // React.useEffect(() => {
  //   if (isOnRoundIntro) {
  //     navigation.setOptions({
  //       ...headerTheme({ dark: true }),
  //       headerTitleStyle: {
  //         opacity: 0,
  //       },
  //     })
  //   }
  // }, [isOnRoundIntro])

  async function handleReadyClick() {
    if (isSubmitting === true) {
      return
    }
    setIsSubmitting(true)

    try {
      await Papers.markMeAsReadyForNextRound()
    } catch (error) {
      // TODO errorMsg here
    }
  }

  if (isOnRoundIntro) {
    // TODO make the header dark too...
    return (
      <Page>
        <Page.Main style={{ backgroundColor: Theme.colors.grayDark }}>
          <View
            style={[
              Styles.header,
              {
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flexGrow: 1,
              },
            ]}
          >
            <Text style={[Theme.typography.h1, { color: Theme.colors.bg }]}>
              Round {roundIx + 1 + 1}
            </Text>
            <Text
              style={[
                Theme.typography.body,
                Theme.u.center,
                { width: 225, color: Theme.colors.bg, marginTop: 24 },
              ]}
            >
              {DESCRIPTIONS[roundIx + 1]}
            </Text>
          </View>
        </Page.Main>
        <Page.CTAs style={{ backgroundColor: Theme.colors.grayDark }}>
          <Button isLoading={isSubmitting} onPress={handleReadyClick}>
            {`I'm ready!`}
          </Button>
        </Page.CTAs>
      </Page>
    )
  }

  return (
    <Page>
      {!isTie && isFinalRound && <EmojiRain type={isMyTeamWinner ? 'winner' : 'loser'} />}
      <Page.Main blankBg>
        <View style={[Styles.header, { marginTop: 40, marginBottom: 16 }]}>
          {isFinalRound ? (
            <Fragment>
              <Text style={Theme.typography.h1}>
                {isTie ? 'Stalemate' : isMyTeamWinner ? 'Your team won!' : 'Your team lost!'}
              </Text>
              <Text style={Theme.typography.body}>
                {isTie ? "It's a tie" : isMyTeamWinner ? 'They never stood a chance' : 'Yikes.'}
              </Text>
            </Fragment>
          ) : (
            <Fragment>
              <Text style={Theme.typography.h3}>
                {isTie
                  ? "It's a tie!"
                  : isMyTeamWinner
                  ? 'Your team won this round!'
                  : 'Your team lost this round...'}
              </Text>
            </Fragment>
          )}
        </View>

        <GameScore BOAT={isFinalRound} />
      </Page.Main>
      <Page.CTAs blankBg>
        {isFinalRound ? (
          <Button
            onPress={() => {
              navigation.navigate('gate', { goal: 'leave' })
              Papers.leaveGame()
            }}
          >
            Go to homepage
          </Button>
        ) : (
          <Button isLoading={isSubmitting} onPress={() => setIsOnRoundIntro(true)}>
            {`Start round ${round.current + 1 + 1}!`}
          </Button>
        )}
      </Page.CTAs>
    </Page>
  )
}

RoundScore.propTypes = {
  navigation: PropTypes.object.isRequired,
}

export default RoundScore
