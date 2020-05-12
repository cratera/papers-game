import React from 'react'
import { Alert, Platform, Text } from 'react-native'
import PropTypes from 'prop-types'
// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import { createStackNavigator } from '@react-navigation/stack'
// import { confirmLeaveGame } from '@constants/utils.js'
import PapersContext from '@store/PapersContext.js'

import GameLobby from './Lobby.js'
import GameTeams from './Teams.js'
import GamePlayingEntry from './playing/PlayingEntry'

import Page from '@components/page'
import Button from '@components/button'

const Stack = createStackNavigator()

export default function GameRoomEntry({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const { id: gameId } = game || {}

  const profileId = profile && profile.id
  // const gameHasStarted = !!game && game.hasStarted
  const [status, setStatus] = React.useState(gameId ? 'ready' : 'loading') // needProfile || ready  || notFound

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Create game',
      // headerLeft: function HBS() {
      //   return (
      //     <Page.HeaderBtn side="left" onPress={handleCancelPress}>
      //       Cancel
      //     </Page.HeaderBtn>
      //   )
      // },
      // headerRight: null,
      headerLeft: null,
      headerRight: function HBS() {
        return profile.name ? <Page.HeaderBtnSettings /> : null
      },
      headerTintColor: '#fff', // TODO this
      headerStyle: {
        shadowColor: 'transparent',
        borderBottomWidth: 0,
        // height: 72, // REVIEW @mmbotelho
      },
    })
  }, [])

  React.useEffect(() => {
    if (!profileId) {
      // REVIEW - do this validation at App.js?
      return setStatus('noProfile')
    }

    if (gameId) {
      return setStatus('ready')
    } else {
      // REVIEW - if just left game, add global status?
      navigation.navigate('home')
    }
  }, [gameId, profileId])

  // React.useEffect(() => {
  //   if (gameHasStarted) {
  //     console.log('Navigating to playing...')
  //     // navigation.navigate('playing');
  //   }
  // }, [gameHasStarted])

  if (!profileId || status === 'noProfile') {
    return (
      <Template>
        <Text>To join {gameId || 'a room'} you need to create a profile before!</Text>

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

  // NOTE: didn't understand yet how dynamic routing works on RN.
  // If this is the right way of doing it, I don't like it.
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="lobby" component={GameLobby} />
      {!game.teams ? <Stack.Screen name="teams" component={GameTeams} /> : null}
      {game.teams ? <Stack.Screen name="playing" component={GamePlayingEntry} /> : null}
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
  navigation: PropTypes.shape({
    navigate: PropTypes.func, // (componentName: String)
    setOptions: PropTypes.func,
  }),
}

GameRoomEntry.navigationOptions = {
  header: null,
}

const Template = ({ children }) => (
  <Page>
    <Page.Header />
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
