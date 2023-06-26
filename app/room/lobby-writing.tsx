import { Redirect, Stack } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import Button from '@src/components/button'
import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import useLeaveGame from '@src/components/settings/useLeaveGame2'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import { Profile, Words } from '@src/store/PapersContext.types'
import * as Theme from '@src/theme'

export default function LobbyWriting() {
  const Papers = usePapersContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>()
  const { askToLeaveGame } = useLeaveGame()
  const { game, profile } = Papers.state || {}
  const hasGame = !!game

  const profileId = profile && profile.id
  const creatorId = hasGame && game.creatorId
  const profileIsAdmin = creatorId === profileId

  const didSubmitAllWords = useCallback(
    (plId: Profile['id']) => {
      const gameWords: Words = (hasGame && game.words) || ({} as Words)

      return gameWords[plId]?.length === game?.settings.words
    },
    [game?.settings.words, game?.words, hasGame]
  )
  const didEveryoneSubmittedTheirWords =
    game?.players && Object.keys(game.players).every(didSubmitAllWords)

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

  if (!game) {
    return <Redirect href="/room/gate" />
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: didEveryoneSubmittedTheirWords ? 'All done!' : 'Waiting...',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
              Exit
            </Page.HeaderBtn>
          ),
        }}
      />

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
