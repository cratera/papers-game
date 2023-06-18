import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { ScrollView, Text } from 'react-native'

import { analytics as Analytics } from '@src/services/firebase'

import PapersContext from '@src/store/PapersContext'
import * as Theme from '@src/theme'

import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'

import SettingsGame from './SettingsGame'
import SettingsProfile from './SettingsProfile'
import SettingsProfileAvatar from './SettingsProfileAvatar'
// import Account from './Account'
import AccountDeletion from './AccountDeletion'
import Experimental from './Experimental'
import Feedback from './Feedback'
import Privacy from './Privacy'
import Purchases from './Purchases'
import SettingSoundAnimations from './SettingsSoundAnimations'
import Statistics from './Statistics'

import { AppStackParamList } from '@src/navigation/navigation.types'
import { useSubHeader } from './utils'

const Stack = createStackNavigator<AppStackParamList>()

export default function Settings() {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state

  React.useEffect(() => {
    Analytics.setCurrentScreen('settings')
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {game ? (
        <>
          <Stack.Screen name="settings-game" component={SettingsGame} />
          <Stack.Screen name="settings-players" component={SettingsPlayers} />
        </>
      ) : null}
      <Stack.Screen name="settings-profile" component={SettingsProfile} />
      <Stack.Screen name="settings-profile-avatar" component={SettingsProfileAvatar} />
      {/* <Stack.Screen name="settings-account" component={Account} /> */}
      <Stack.Screen name="settings-accountDeletion" component={AccountDeletion} />
      <Stack.Screen name="settings-privacy" component={Privacy} />
      <Stack.Screen name="settings-purchases" component={Purchases} />
      <Stack.Screen name="settings-experimental" component={Experimental} />

      <Stack.Screen name="settings-statistics" component={Statistics} />
      <Stack.Screen name="settings-feedback" component={Feedback} />
      <Stack.Screen name="settings-sound" component={SettingSoundAnimations} />
      <Stack.Screen name="settings-credits" component={SettingsCredits} />
    </Stack.Navigator>
  )
}

// ======

function SettingsCredits({ navigation }: StackScreenProps<AppStackParamList, 'settings-credits'>) {
  useSubHeader(navigation, 'Acknowledgements')

  return (
    <Page>
      <Page.Main style={Theme.spacing.pt_24}>
        <ScrollView>
          <Text style={Theme.typography.body}>TODO: Acknowledgments on the way...</Text>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

// ======

function SettingsPlayers({ navigation }: StackScreenProps<AppStackParamList, 'settings-players'>) {
  useSubHeader(navigation, 'Players')

  return (
    <Page>
      <Page.Main style={Theme.spacing.pt_16}>
        <ScrollView>
          <ListTeams enableKickout />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
