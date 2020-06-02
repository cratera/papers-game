import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types'
// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import { createStackNavigator } from '@react-navigation/stack'
// import { confirmLeaveGame } from '@constants/utils.js'
import PapersContext from '@store/PapersContext.js'

import LobbyJoining from './LobbyJoining.js'
import Teams from './Teams.js'
import WritePapers from './WritePapers'
import LobbyWriting from './LobbyWriting.js'
import Playing from './playing/PlayingEntry'

import Page from '@components/page'
import Button from '@components/button'

const Stack = createStackNavigator()

export default function GameRoomEntry({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const { id: gameId } = game || {}
  const [status, setStatus] = React.useState(gameId ? 'ready' : 'loading') // needProfile || ready  || notFound
  const profileId = profile?.id
  const wordsAreStored = game?.words && game.words[profileId]

  React.useLayoutEffect(() => {
    if (!game) {
      // Unexpect lost of game. (e.g. Game was directly deleted from DB)
      console.warn('!game. Unexpected')
      navigation.navigate('home')
    }
  }, [game])

  React.useEffect(() => {
    if (gameId) {
      return setStatus('ready')
    } else {
      console.warn('!gameId roomEntry. Left game?')
      // REVIEW - if just left game, add global status?
      navigation.navigate('home')
    }
  }, [gameId, profileId])

  if (!profileId || status === 'noProfile') {
    return (
      <Template>
        <Text>To join {gameId || 'a game'} you need to create a profile before!</Text>

        <Button onPress={() => navigation.navigate('home')}>Create profile</Button>
      </Template>
    )
  }

  if (status === 'loading') {
    return (
      <Template>
        <Text>
          Joining {`"${profile.gameId}"`}...
          {'\n'}
          {'\n'}
        </Text>
        {/* <Button onPress={() => navigation.navigate('home')}>Taking too long? Go Home</Button> */}
      </Template>
    )
  }

  /* REVIEW TODO - HANDLE THIS CASE */
  // if (status === 'notFound') {
  //   return (
  //     <Template>
  //       <Text>Ups, the game "{urlGameId}" doesn't seem to exist!</Text>
  //       <Button onPress={() => navigation.navigate('home')}>Go Home</Button>
  //     </Template>
  //   );
  // }

  if (status === 'ups' || !gameId) {
    return (
      <Template>
        <Text>Ups, something went wrong while loading {gameId}.</Text>
        <Button onPress={() => navigation.navigate('home')}>Go Home</Button>
      </Template>
    )
  }

  const amIReady = game?.players[profileId]?.isReady

  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: 'center' }}
      initialRouteName={amIReady ? 'playing' : wordsAreStored ? 'lobby-writing' : 'lobby-joining'}
    >
      {game.hasStarted || amIReady ? (
        <Stack.Screen name="playing" component={Playing} />
      ) : (
        <>
          <Stack.Screen name="lobby-joining" headerTitle="New game" component={LobbyJoining} />
          <Stack.Screen name="teams" headerTitle="Teams" component={Teams} />
          <Stack.Screen name="write-papers" headerTitle="Write papers" component={WritePapers} />
          <Stack.Screen name="lobby-writing" headerTitle="Writting" component={LobbyWriting} />
        </>
      )}
    </Stack.Navigator>
  )
}

// export default function ErrorTodoThis({ navigation }) {
//   return (
//     <ErrorBoundary>
//       <GameRoomEntry navigation={navigation} />
//     </ErrorBoundary>
//   )
// }

GameRoomEntry.propTypes = {
  navigation: PropTypes.object, // ReactNavigation
}

const Template = ({ children }) => (
  <Page>
    <Page.Main>{children}</Page.Main>
  </Page>
)

Template.propTypes = {
  children: PropTypes.node,
}

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = { hasError: false }
//   }

//   static getDerivedStateFromError(error) {
//     console.warn('error', error)
//     // Update state so the next render will show the fallback UI.
//     return { hasError: true }
//   }

//   render() {
//     if (this.state.hasError) {
//       // You can render any custom fallback UI
//       return <h1>Something went wrong.</h1>
//     }

//     return this.props.children
//   }
// }
