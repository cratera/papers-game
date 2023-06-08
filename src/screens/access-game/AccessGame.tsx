import React from 'react'

import { analytics as Analytics } from '@src/services/firebase'

import { StackScreenProps } from '@react-navigation/stack'
import { AppStackParamList } from '@src/navigation/navigation.types.js'
import PapersContext from '@src/store/PapersContext'
import CreateGame from './CreateGame.js'
import JoinGame from './JoinGame.js'

export default function AccessGame({
  route,
  navigation,
}: StackScreenProps<AppStackParamList, 'access-game'>) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const gameId = game?.id
  const { variant } = route.params

  React.useEffect(() => {
    if (!variant) {
      navigation.navigate('home')
    } else {
      Analytics.setCurrentScreen(`${variant}_game`) // join_game || create_game
    }
  }, [navigation, variant])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId, navigation])

  if (variant === 'join') {
    return <JoinGame navigation={navigation} />
  } else if (variant === 'create') {
    return <CreateGame navigation={navigation} />
  }
  return null
}
