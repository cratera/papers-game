import PropTypes from 'prop-types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import PapersContext from '@src/store/PapersContext'
import { isTamagoshi } from '@src/utils/device'

import Avatar from '@src/components/avatar'
import Bubbling from '@src/components/bubbling'
import Button from '@src/components/button'
import { IllustrationStars } from '@src/components/icons'
import { LoadingBadge } from '@src/components/loading'
import Page from '@src/components/page'
import * as Theme from '@src/theme'

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
        } catch {
          // TODO: errorMsg on page.
          console.warn('pingReadyStatus failed')
        }
      }, 4000)

    return () => {
      clearTimeout(pingReadyStatus)
    }
  }, [isAllReady])

  async function onStartClick() {
    try {
      Papers.startTurn()
    } catch (e) {
      // TODO: errorMsg on page.
      console.warn('start turn failed', e.message)
    }
  }

  return (
    <Page>
      {isAllReady && <Bubbling fromBehind bgStart="bg" bgEnd="green" />}
      <Page.Main headerDivider>
        <View style={[Styles.header, { paddingTop: 32 }]}>
          <Text
            style={isTamagoshi ? Theme.typography.h2 : Theme.typography.h1}
          >{`It's your turn!`}</Text>
          <View style={StylesIn.illustration}>
            <IllustrationStars style={StylesIn.svg} />
            <Avatar src={profile.avatar} alt="" size={isTamagoshi ? 'xl' : 'xxl'} />
          </View>
          <Text style={Theme.typography.secondary}>Round {roundNr}</Text>
          <Text
            style={[Theme.typography.body, Theme.utils.center, { marginTop: 12, maxWidth: 300 }]}
          >
            {description}
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        {isAllReady ? (
          <Button onPress={onStartClick}>Start</Button>
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

const areaHeight = {
  sm: 200,
  md: 273,
}

const StylesIn = StyleSheet.create({
  illustration: {
    width: 229,
    height: isTamagoshi ? areaHeight.sm : areaHeight.md,
    marginTop: isTamagoshi ? 16 : 36,
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 229,
    height: isTamagoshi ? areaHeight.sm : areaHeight.md,
  },
})

export default MyTurnGetReady
