import React from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import { analytics as Analytics } from '@src/services/firebase'

import PapersContext from '@src/store/PapersContext'

import * as Theme from '@src/theme'

import { StackScreenProps } from '@react-navigation/stack'
import Button from '@src/components/button'
import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import { useLeaveGame } from '@src/components/settings'
import { headerTheme } from '@src/navigation/headerStuff'
import { AppStackParamList } from '@src/navigation/navigation.types'
import { Profile, Words } from '@src/store/PapersContext.types'

export default function LobbyWriting({
  navigation,
}: StackScreenProps<AppStackParamList, 'lobby-writing'>) {
  const Papers = React.useContext(PapersContext)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string>()
  const { askToLeaveGame } = useLeaveGame({
    navigation,
  })
  const { game, profile } = Papers.state || {}
  const hasGame = !!game

  const profileId = profile && profile.id
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId

  const didSubmitAllWords = React.useCallback(
    (plId: Profile['id']) => {
      const gameWords: Words = (hasGame && game.words) || ({} as Words)

      return gameWords[plId]?.length === game?.settings.words
    },
    [game?.settings.words, game?.words, hasGame]
  )
  const didEveryoneSubmittedTheirWords =
    game?.players && Object.keys(game.players).every(didSubmitAllWords)

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
    if (game?.teams) {
      Analytics.setCurrentScreen('game_lobby_writing')
    }
  }, [askToLeaveGame, game?.teams, navigation])

  React.useEffect(() => {
    if (didEveryoneSubmittedTheirWords) {
      navigation.setOptions({
        headerTitle: 'All done!',
      })
    }
  }, [didEveryoneSubmittedTheirWords, navigation])

  async function handleReadyClick() {
    if (isSubmitting === true) {
      return
    }

    setIsSubmitting(true)
    if (errorMsg) {
      setErrorMsg(undefined)
    }

    try {
      await Papers.markMeAsReady()
    } catch (e) {
      const error = e as Error

      setErrorMsg(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <Page>
      {/* {didEveryoneSubmittedTheirWords && (
        <Bubbling fromBehind bgStart={Theme.colors.bg} bgEnd={Theme.colors.purple} />
      )} */}
      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <ListTeams isStatusVisible style={Theme.spacing.pt_24} />
          <View style={Theme.utils.ctaSafeArea} />
        </ScrollView>
      </Page.Main>
      {__DEV__ && profileIsAdmin && (
        <Page.CTAs hasOffset>
          <Button
            variant="danger"
            onPress={Papers.setWordsForEveryone}
            styleTouch={Theme.spacing.mt_16}
          >
            {"💥 Write everyone's papers 💥"}
          </Button>
        </Page.CTAs>
      )}
      {didEveryoneSubmittedTheirWords && (
        <Page.CTAs hasOffset>
          <Text style={[Theme.typography.error, Theme.utils.center, Theme.spacing.mb_8]}>
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
