import React from 'react'
import { Text } from 'react-native'
import PropTypes from 'prop-types'
// import * as WebBrowser from 'expo-web-browser'; // WHAT'S THIS?

import { createStackNavigator } from '@react-navigation/stack'

import PapersContext from '@store/PapersContext.js'

import GameLobby from './Lobby.js'
import GameTeams from './Teams.js'
import GamePlaying from './playing'

import Page from '@components/page'
import Button from '@components/button'

const Stack = createStackNavigator()

export default function GameRoom({ navigation }) {
  const Papers = React.useContext(PapersContext)
  const { profile, game } = Papers.state
  const { id: gameId } = game || {}

  const profileId = profile && profile.id
  const gameHasStarted = !!game && game.hasStarted
  const [status, setStatus] = React.useState(gameId ? 'ready' : 'loading') // needProfile || ready  || notFound

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

  React.useEffect(() => {
    if (gameHasStarted) {
      console.log('TODO - Navigating to playing...')
      // navigation.navigate('playing');
    }
  }, [gameHasStarted])

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

  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="lobby" component={GameLobby} />
      {game && <Stack.Screen name="playing" component={GamePlaying} />}
      {!game.teams ? <Stack.Screen name="teams" component={GameTeams} /> : null}
    </Stack.Navigator>
  )
}

GameRoom.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func, // (componentName: String)
  }),
}

GameRoom.navigationOptions = {
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
