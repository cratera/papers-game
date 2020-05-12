import React from 'react'
import { Alert, Platform } from 'react-native'

import PapersContext from '@store/PapersContext.js'

export default function useLeaveGame() {
  const Papers = React.useContext(PapersContext)

  const askToLeaveGame = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave the game?')) {
        Papers.leaveGame()
      }
    } else {
      Alert.alert(
        'Exit game',
        'Are you sure you want to leave the game?',
        [
          {
            text: 'Leave Game',
            onPress: Papers.leaveGame,
            style: 'destructive',
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Leave game cancelled'),
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }
  }

  return { askToLeaveGame }
}
