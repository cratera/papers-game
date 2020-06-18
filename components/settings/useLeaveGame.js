import React from 'react'
import { Alert, Platform } from 'react-native'

import PapersContext from '@store/PapersContext.js'

export default function useLeaveGame({ navigation }) {
  const Papers = React.useContext(PapersContext)

  function leaveGame() {
    if (!navigation) {
      console.warn('navigation is required!')
    }
    navigation.navigate('gate', { goal: 'leave' })
    Papers.leaveGame()
  }

  const askToLeaveGame = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave the game?')) {
        leaveGame()
      }
    } else {
      Alert.alert(
        'Exit game',
        'Are you sure you want to leave the game?',
        [
          {
            text: 'Leave Game',
            onPress: leaveGame,
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
