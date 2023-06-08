import React from 'react'
import { Alert, Platform } from 'react-native'

import * as Sentry from '@src/services/sentry'

import PapersContext from '@src/store/PapersContext'

const i18n = {
  leave_title: 'Leave game',
  leave_confirm_0: 'Are you sure you want to leave the game?',
  leave_confirm_1: "You can't join again.",
}
export default function useLeaveGame({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const hasTeams = !!Papers.state.game.teams
  const msg = i18n.leave_confirm_0 + (hasTeams ? ` ${i18n.leave_confirm_1}` : '')
  function leaveGame() {
    if (!navigation) {
      Sentry.captureMessage('LeaveGame without navigation')
    }
    navigation.navigate('gate', { goal: 'leave' })
    Papers.leaveGame()
  }

  const askToLeaveGame = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        leaveGame()
      }
    } else {
      Alert.alert(
        i18n.leave_title,
        msg,
        [
          {
            text: 'Leave Game',
            onPress: leaveGame,
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

  return { askToLeaveGame }
}
