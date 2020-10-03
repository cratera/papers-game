import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'

import { IconTimes } from '@components/icons'
import Page from '@components/page'
import GameScore from '@components/game-score'
import { useLeaveGame } from '@components/settings'

import Item from './Item.js'
import { useSubHeader } from './utils'

export default function SettingsGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame({ navigation: navigation.dangerouslyGetParent() })
  const { game } = Papers.state

  useSubHeader(navigation, '')

  if (!game) {
    return null
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={Theme.u.scrollSideOffset}>
          <Text style={[Theme.typography.h2, Theme.u.center]} accessibilityRole="header">
            {game.name}
          </Text>
          <Text
            style={[Theme.typography.small, Theme.u.center, { marginTop: 4, marginBottom: 8 }]}
            accessibilityLabel={game.code.toString()}
          >
            {game.code.toString().split('').join('・')}
          </Text>
          {game.round && <GameScore />}
          <View style={Theme.u.cardEdge}>
            <View style={Theme.u.listDivider} />
            <Item
              title="Settings"
              icon="next"
              onPress={() => navigation.navigate('settings-profile')}
            />
            <View style={Theme.u.listDivider} />
            <Item title="Leave Game" variant="danger" Icon={IconTimes} onPress={askToLeaveGame} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsGame.propTypes = {
  onMount: PropTypes.object, // react-navigation
  navigation: PropTypes.object.isRequired, // react-navigation
}
