import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import GameScore from '@src/components/game-score'
import { IconTimes } from '@src/components/icons'
import Page from '@src/components/page'
import Item from '@src/components/settings/Item'
import useLeaveGame from '@src/components/settings/useLeaveGame2'
import headerTheme from '@src/navigation/headerTheme'
import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

export default function GameSettings() {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const router = useRouter()
  const { askToLeaveGame } = useLeaveGame()

  if (!game) {
    return null
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme({
            hiddenTitle: false,
          }),
          headerTitle: 'Game',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

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

            <Item title="Settings" icon="next" onPress={() => router.push('/settings')} />

            <View style={Theme.utils.listDivider} />

            <Item title="Leave Game" variant="danger" Icon={IconTimes} onPress={askToLeaveGame} />

            <Text>{'\n'}</Text>
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
