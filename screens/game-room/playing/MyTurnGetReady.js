import React from 'react'
import { Image, View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import Bubbling from '@components/bubbling'
import Button from '@components/button'
import Page from '@components/page'
import { IllustrationStars } from '@components/icons'
import { LoadingBadge } from '@components/loading'
import * as Theme from '@theme'

import Styles from './PlayingStyles.js'

const MyTurnGetReady = ({ description, amIWaiting }) => {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const round = game.round
  const roundNr = round.current + (amIWaiting ? 2 : 1)
  const isAllReady = game.hasStarted && !amIWaiting

  React.useEffect(() => {
    const pingReadyStatus =
      !isAllReady &&
      setInterval(() => {
        try {
          Papers.pingReadyStatus()
        } catch {}
      }, 4000)

    return () => {
      clearTimeout(pingReadyStatus)
    }
  }, [isAllReady])

  async function onStartClick() {
    try {
      Papers.startTurn()
    } catch (e) {
      // TODO - errorMsg on page.
      console.warn('start turn failed', e.message)
    }
  }

  return (
    <Page>
      {isAllReady && <Bubbling fromBehind bgStart={Theme.colors.bg} bgEnd={Theme.colors.green} />}
      <Page.Main headerDivider>
        <View style={[Styles.header, { paddingTop: 32 }]}>
          <Text style={Theme.typography.h1}>{`It's your turn!`}</Text>
          <View style={StylesIn.illustration}>
            <IllustrationStars style={StylesIn.svg} width="229" height="273" />
            <Image
              style={[StylesIn.avatar]}
              source={{ uri: profile.avatar }}
              accessibilityLabel=""
            />
          </View>
          <Text style={Theme.typography.secondary}>Round {roundNr}</Text>
          <Text style={[Theme.typography.body, Theme.u.center, { marginTop: 12, maxWidth: 300 }]}>
            {description}
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        {isAllReady ? (
          <Button onPress={onStartClick}>Start turn</Button>
        ) : (
          <>
            <LoadingBadge size="sm" style={{ marginBottom: 16 }}>
              Waiting for other players...
            </LoadingBadge>
          </>
        )}
      </Page.CTAs>
    </Page>
  )
}

MyTurnGetReady.propTypes = {
  description: PropTypes.string.isRequired,
  roundIx: PropTypes.number,
  amIWaiting: PropTypes.bool,
}

const StylesIn = StyleSheet.create({
  illustration: {
    width: 229,
    height: 273, // illustration svg size
    marginVertical: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  avatar: {
    width: 100,
    height: 100,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
  },
  mirror: {
    transform: [{ scaleX: -1 }, { rotate: '18deg' }],
  },
})

export default MyTurnGetReady
