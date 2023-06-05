import PropTypes from 'prop-types'
import React from 'react'

import { analytics as Analytics } from '@src/services/firebase'

import PapersContext from '@src/store/PapersContext.js'
import CreateGame from './CreateGame.js'
import JoinGame from './JoinGame.js'

export default function AccessGame({ route, navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const gameId = game?.id
  const { variant } = route.params || {}

  React.useEffect(() => {
    if (!variant) {
      navigation.navigate('home')
    } else {
      Analytics.setCurrentScreen(`${variant}_game`) // join_game || create_game
    }
  }, [variant])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room', { screen: 'lobby-joining' })
    }
  }, [gameId])

  if (variant === 'join') {
    return <JoinGame navigation={navigation} />
  } else if (variant === 'create') {
    return <CreateGame navigation={navigation} />
  }
  return null
}

AccessGame.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
  route: PropTypes.shape({
    params: PropTypes.shape({
      variant: PropTypes.string,
    }),
  }).isRequired, // ReactNavigation
}
