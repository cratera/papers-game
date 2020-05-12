import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Image, View, Text } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PapersContext from '@store/PapersContext.js'
import imgWaiting from '@assets/images/waiting.gif'
import imgDone from '@assets/images/done.gif'

import * as Theme from '@theme'
import Styles from './LobbyStyles.js'

import Page from '@components/page'
import Button from '@components/button'
import ListTeams from '@components/list-teams'
import { useLeaveGame } from '@components/settings'

export default function LobbyWritting({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame()
  const { game } = Papers.state || {}
  const gameWords = !!game && game.words

  const didSubmitAllWords = React.useCallback(
    plId =>
      game && game.words && game.words[plId] && game.words[plId].length === game.settings.words,
    [gameWords]
  )
  const didEveryoneSubmittedTheirWords = Object.keys(game.players).every(didSubmitAllWords)

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'New game',
      headerLeft: function HLB() {
        return (
          <Page.HeaderBtn side="left" onPress={askToLeaveGame}>
            Exit
          </Page.HeaderBtn>
        )
      },
      headerRight: null,
      headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
      },
    })
  }, [])

  return (
    <Fragment>
      <Page>
        <Page.Main>
          <ScrollView style={Theme.u.scrollSideOffset}>
            <View style={Styles.header}>
              <Text style={Theme.typography.secondary}>
                {!didEveryoneSubmittedTheirWords
                  ? 'Waiting for other players'
                  : 'Everyone finished!'}
              </Text>
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
          <Button onPress={Papers.markMeReady}>I'm ready!</Button>
        </Page.CTAs>
      </Page>
      {/* <WritePapersModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} /> */}
    </Fragment>
  )
}

LobbyWritting.propTypes = {
  navigation: PropTypes.object.isRequired, // react-navigation
}
