import React from 'react'
import { ScrollView, Text } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import * as Theme from '@theme'
import Page from '@components/page'
import GameScore from '@components/game-score'
import { useLeaveGame } from '@components/settings'

import Item from './Item.js'
import MoreOptions from './MoreOptions.js'

export default function SettingsGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { askToLeaveGame } = useLeaveGame({ navigation: navigation.dangerouslyGetParent() })
  const { game } = Papers.state

  if (!game) {
    return null
  }

  return (
    <Page>
      <Page.Main>
        <ScrollView style={Theme.u.scrollSideOffset}>
          <Text
            style={[Theme.typography.h2, Theme.u.center, { marginTop: 24 }]}
            accessibilityRole="header"
          >
            {game.name}
          </Text>
          <Text
            style={[Theme.typography.small, Theme.u.center, { marginTop: 4, marginBottom: 16 }]}
            accessibilityLabel={game.code.toString()}
          >
            {game.code.toString().split('').join('・')}
          </Text>
          {game.round && (
            <GameScore
              id="gs"
              style={{
                paddingBottom: 16,
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.grayLight,
              }}
            />
          )}
          {[
            {
              id: 'pl',
              title: 'Players',
              icon: 'next',
              onPress: () => {
                navigation.navigate('settings-players')
              },
            },
          ].map(item => (
            <Item key={item.id} {...item} />
          ))}

          <MoreOptions
            navigation={navigation}
            list={[
              {
                id: 'lg',
                title: 'Leave Game',
                variant: 'danger',
                onPress: askToLeaveGame,
              },
            ]}
          />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

SettingsGame.propTypes = {
  onMount: PropTypes.object, // react-navigation
  navigation: PropTypes.object.isRequired, // react-navigation
}
