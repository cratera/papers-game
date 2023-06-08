import PropTypes from 'prop-types'
import React from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { analytics as Analytics } from '@src/services/firebase'

import PapersContext from '@src/store/PapersContext'

import * as Theme from '@src/theme'
// import Styles from './LobbyStyles.js'

import Button from '@src/components/button'
import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import { useLeaveGame } from '@src/components/settings'
import { headerTheme } from '@src/navigation/headerStuff'

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
    (plId) => gameWords[plId]?.length === game.settings.words,
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
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <ListTeams isStatusVisible style={{ paddingTop: 24 }} />
          <View style={Theme.utils.CTASafeArea} />
        </ScrollView>
      </Page.Main>
      {__DEV__ && profileIsAdmin && (
        <Page.CTAs hasOffset>
          <Button
            variant="danger"
            onPress={Papers.setWordsForEveryone}
            styleTouch={{ marginTop: 16 }}
          >
            {"💥 Write everyone's papers 💥"}
          </Button>
        </Page.CTAs>
      )}
      {didEveryoneSubmittedTheirWords && (
        <Page.CTAs hasOffset>
          <Text style={[Theme.typography.error, Theme.utils.center, { marginBottom: 8 }]}>
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
