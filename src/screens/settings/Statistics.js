import React from 'react'
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import Button from '@src/components/button'
import Page from '@src/components/page'

import { propTypesCommon, useSubHeader } from './utils'

// Note: This is directly related to PapersContext - statsDefaults
const statsI18n = [
  ['gamesCreated', 'Games created'],
  ['gamesJoined', 'Games joined'],
  ['gamesWon', 'Games won'],
  ['gamesLost', 'Games lost'],
  ['papersGuessed', 'Papers guessed'],
]
export default function SettingsAccount({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { stats } = Papers.state.profile
  useSubHeader(navigation, 'Statistics')

  async function handleResetStats() {
    if (Platform.OS === 'web') {
      if (window.confirm('This will resets your statistics from your phone. Are you sure?')) {
        await Papers.resetProfile()
        navigation.getParent().reset({
          index: 0,
          routes: [{ name: 'home' }],
        })
      }
    } else {
      Alert.alert(
        'Reset stats',
        'This will reset your profile statistics from your phone',
        [
          {
            text: 'Reset statistics',
            onPress: async () => {
              await Papers.resetProfileStats()
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => true,
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <View style={Styles.list}>
          {statsI18n.map(([statKey, i18n]) => (
            <View key={statKey} style={Styles.item}>
              <Text style={Theme.typography.secondary}>{i18n}</Text>
              <Text style={Theme.typography.body}>{stats[statKey]}</Text>
            </View>
          ))}
        </View>
        <Button onPress={handleResetStats}>Reset statistics</Button>
      </Page.Main>
    </Page>
  )
}

SettingsAccount.propTypes = propTypesCommon

const Styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
    marginBottom: 32,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomColor: Theme.colors.grayLight,
    borderBottomWidth: 1,
  },
})
