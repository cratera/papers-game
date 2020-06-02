import React, { Fragment } from 'react'
import { Image, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import imgWaiting from '@assets/images/waiting.gif'
import imgDone from '@assets/images/done.gif'

import * as Theme from '@theme'
import Styles from './LobbyStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import ListTeams from '@components/list-teams'
import { useLeaveGame } from '@components/settings'
import { headerTheme } from '@navigation/headerStuff.js'

export default function LobbyWriting({ navigation }) {
  const Papers = React.useContext(PapersContext)
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
                source={didEveryoneSubmittedTheirWords ? imgDone : imgWaiting}
                accessibilityLabel=""
              />
            </View>
            <ListTeams isStatusVisible />
          </ScrollView>
        </Page.Main>
        <Page.CTAs hasOffset>
          <Button onPress={Papers.markMeAsReady}>{"I'm ready!"}</Button>
        </Page.CTAs>
      </Page>
    </Fragment>
  )
}

LobbyWriting.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
