import React from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import * as Analytics from '@constants/analytics.js'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'
// import Styles from './LobbyStyles.js'

import Bubbling from '@components/bubbling'
import Page from '@components/page'
import Button from '@components/button'
import ListTeams from '@components/list-teams'
import { useLeaveGame } from '@components/settings'
import { headerTheme } from '@navigation/headerStuff.js'

export default function LobbyWriting({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState('')
  const { askToLeaveGame } = useLeaveGame({ navigation })
  const { game, profile } = Papers.state || {}
  const hasGame = !!game
  const gameWords = (hasGame && game.words) || {}
  const profileId = profile && profile.id
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId

  const didSubmitAllWords = React.useCallback(
    plId => gameWords[plId]?.length === game.settings.words,
    [gameWords]
  )
  const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords)

  React.useEffect(() => {
    navigation.setOptions({
      ...headerTheme(),
      headerTitle: 'Waiting...',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
            Exit
          </Page.HeaderBtn>
        )
      },
      headerRight: function HLB() {
        return <Page.HeaderBtnSettings />
      },
    })
    if (game.teams) {
      Analytics.setCurrentScreen('game_lobby_writing')
    }
  }, [])

  React.useEffect(() => {
    if (didEveryoneSubmittedTheirWords) {
      navigation.setOptions({
        headerTitle: 'All done!',
      })
    }
  }, [didEveryoneSubmittedTheirWords])

  async function handleReadyClick() {
    if (isSubmitting === true) {
      return
    }

    setIsSubmitting(true)
    if (errorMsg) {
      setErrorMsg(null)
    }

    try {
      await Papers.markMeAsReady()
    } catch (e) {
      setErrorMsg(e.message)
      setIsSubmitting(false)
    }
  }

  return (
    <Page>
      {/* {didEveryoneSubmittedTheirWords && (
        <Bubbling fromBehind bgStart={Theme.colors.bg} bgEnd={Theme.colors.purple} />
      )} */}
      <Page.Main headerDivider>
        <ScrollView style={Theme.u.scrollSideOffset}>
          <ListTeams isStatusVisible style={{ paddingTop: 24 }} />
          <View style={Theme.u.CTASafeArea} />
        </ScrollView>
      </Page.Main>
      {__DEV__ && profileIsAdmin && (
        <Page.CTAs hasOffset>
          <Button
            variant="danger"
            onPress={Papers.setWordsForEveyone}
            styleTouch={{ marginTop: 16 }}
          >
            {"💥 Write everyone's papers 💥"}
          </Button>
        </Page.CTAs>
      )}
      {didEveryoneSubmittedTheirWords && (
        <Page.CTAs hasOffset>
          <Text style={[Theme.typography.error, Theme.u.center, { marginBottom: 8 }]}>
            {errorMsg}
          </Text>

          <Button place="float" isLoading={isSubmitting} onPress={handleReadyClick}>
            {"I'm ready!"}
          </Button>
        </Page.CTAs>
      )}
    </Page>
  )
}

LobbyWriting.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
