import React, { Fragment } from 'react'
import { Image, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import * as Theme from '@theme'
import Styles from './LobbyStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import ListTeams from '@components/list-teams'
import { useLeaveGame } from '@components/settings'
import { headerTheme } from '@navigation/headerStuff.js'

const imgWaiting =
  'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2Fwaiting.gif?alt=media&token=e3bc3fde-7d8b-48f7-afc1-b0135fc6fa20'
const imgDone =
  'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2Fdone.gif?alt=media&token=ffa86784-aa18-414c-95e6-3ae5fcb15ed5'

export default function LobbyWriting({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { askToLeaveGame } = useLeaveGame()
  const { game } = Papers.state || {}
  const gameWords = game?.words
  const didSubmitAllWords = React.useCallback(
    plId => game?.words[plId]?.length === game.settings.words,
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
    })
  }, [])

  React.useEffect(() => {
    if (didEveryoneSubmittedTheirWords) {
      navigation.setOptions({
        headerTitle: 'Done!',
      })
    }
  }, [didEveryoneSubmittedTheirWords])

  async function handleReadyClick() {
    if (isSubmitting === true) {
      return
    }

    setIsSubmitting(true)

    try {
      await Papers.markMeAsReady()
    } catch (error) {
      // TODO handle error
      console.warn('Ready error', error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <Fragment>
      <Page>
        <Page.Main>
          <ScrollView style={Theme.u.scrollSideOffset}>
            <View style={Styles.headerW}>
              <Image
                style={[
                  Styles.header_img,
                  didEveryoneSubmittedTheirWords && Styles.header_img_done,
                ]}
                source={{ uri: didEveryoneSubmittedTheirWords ? imgDone : imgWaiting }}
                accessibilityLabel=""
              />
            </View>
            <ListTeams isStatusVisible />
          </ScrollView>
        </Page.Main>
        <Page.CTAs hasOffset>
          <Button onPress={handleReadyClick} isLoading={isSubmitting}>
            {"I'm ready!"}
          </Button>
        </Page.CTAs>
      </Page>
    </Fragment>
  )
}

LobbyWriting.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
