import PropTypes from 'prop-types'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import GameScore from '@src/components/game-score'
import { IconTimes } from '@src/components/icons'
import Page from '@src/components/page'
import { useLeaveGame } from '@src/components/settings'

import Item from './Item.js'
import { useSubHeader } from './utils'

export default function SettingsGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame({ navigation: navigation.getParent() })
  const { game } = Papers.state

  useSubHeader(navigation, '')

  if (!game) {
    return null
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <Text style={[Theme.typography.h2, Theme.utils.center]} accessibilityRole="header">
            {game.name}
          </Text>
          <Text
            style={[Theme.typography.small, Theme.utils.center, { marginTop: 4, marginBottom: 8 }]}
            accessibilityLabel={game.code.toString()}
          >
            {game.code.toString().split('').join('・')}
          </Text>
          {game.round && <GameScore />}
          <View style={Theme.utils.cardEdge}>
            <View style={Theme.utils.listDivider} />
            <Item
              title="Settings"
              icon="next"
              onPress={() => navigation.navigate('settings-profile')}
            />
            <View style={Theme.utils.listDivider} />
            <Item title="Leave Game" variant="danger" Icon={IconTimes} onPress={askToLeaveGame} />
            <Text>{'\n'}</Text>
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
