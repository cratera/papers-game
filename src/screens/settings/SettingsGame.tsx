import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import GameScore from '@src/components/game-score'
import { IconTimes } from '@src/components/icons'
import Page from '@src/components/page'
import { useLeaveGame } from '@src/components/settings'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types'
import Item from './Item'
import { useSubHeader } from './utils'

export default function SettingsGame({
  navigation,
}: StackScreenProps<AppStackParamList, 'settings-game'>) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame({ navigation: navigation.getParent() })
  const { game } = Papers.state

  useSubHeader(navigation, '')

  if (!game) {
    return null
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <Text style={[Theme.typography.h2, Theme.utils.center]} accessibilityRole="header">
            {game.name}
          </Text>
          <Text
            style={[
              Theme.typography.small,
              Theme.utils.center,
              Theme.spacing.mt_4,
              Theme.spacing.mb_8,
            ]}
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
