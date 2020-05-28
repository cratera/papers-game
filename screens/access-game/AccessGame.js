import React from 'react'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'
import CreateGame from './CreateGame.js'
import JoinGame from './JoinGame.js'

export default function AccessGame({ route, navigation }) {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const gameId = game?.id
  const { variant } = route.params

  React.useEffect(() => {
    if (!variant) {
      goHome()
    }
  }, [variant])

  React.useEffect(() => {
    if (gameId) {
      navigation.navigate('room')
    }
  }, [gameId])

  function goHome() {
    navigation.navigate('home')
  }

  if (variant === 'join') {
    return <JoinGame navigation={navigation} />
  } else if (variant === 'create') {
    return <CreateGame navigation={navigation} />
  }
}

AccessGame.propTypes = {
  navigation: PropTypes.object.isRequired, // ReactNavigation
  route: PropTypes.shape({
    params: PropTypes.shape({
      variant: PropTypes.string,
    }),
  }).isRequired, // ReactNavigation
}
