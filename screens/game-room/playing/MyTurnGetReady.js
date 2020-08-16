import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { IconNonWords } from '@components/icons'

import * as Theme from '@theme'

import Styles from './PlayingStyles.js'

const place = (x, y, deg) => ({
  left: x,
  top: y,
  transform: [{ rotate: deg }],
})

const MyTurnGetReady = ({ description, amIWaiting }) => {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const round = game.round
  const roundNr = round.current + (amIWaiting ? 2 : 1)
  const [startForced, setStartForced] = React.useState(0)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setStartForced(true) // TODO @mmbotelho Show in the UI
    }, 10000)

    return () => {
      clearTimeout(timeout)
    }
  })

  function onStartClick() {
    try {
      Papers.startTurn()
    } catch (e) {
      // TODO - errorMsg on page.
      console.warn('start turn failed', e.message)
    }
  }

  return (
    <Page bgFill={false}>
      <Page.Main>
        <View style={[Styles.header, { marginTop: 8 }]}>
          <Text style={Theme.typography.h2}>{`It's your turn!`}</Text>
          <View style={StylesIn.illustration}>
            <IconNonWords
              color={Theme.colors.primaryLight}
              style={[StylesIn.icon, place(25, 0, '30deg')]}
            />
            <IconNonWords
              color={Theme.colors.primaryLight}
              style={[StylesIn.icon, place(140, -5, '25deg')]}
            />
            <IconNonWords
              color={Theme.colors.primaryLight}
              style={[StylesIn.icon, place(0, 90, '30deg')]}
            />
            <IconNonWords
              color={Theme.colors.primaryLight}
              style={[StylesIn.icon, place(150, 70, '-15deg')]}
            />

            <IconNonWords style={[StylesIn.icon, place(107, 30, '0deg')]} />
            <IconNonWords style={[StylesIn.icon, place(30, 55, '18deg'), StylesIn.mirror]} />
            <IconNonWords style={[StylesIn.icon, place(87, 92, '18deg')]} />
          </View>
          <Text style={Theme.typography.secondary}>Round {roundNr}</Text>
          <Text style={[Theme.typography.bold, Theme.u.center, { marginTop: 8 }]}>
            {description}
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        {game.hasStarted && !amIWaiting ? (
          <Button onPress={onStartClick}>Start turn</Button>
        ) : (
          <>
            {startForced ? (
              <Button
                variant="flat"
                textColor={Theme.colors.primary}
                onPress={Papers.forceStartNextRound}
              >
                Start anyway?
              </Button>
            ) : null}
            <Text style={[Theme.typography.small, Theme.u.center]}>
              Waiting for everyone to be ready.
            </Text>
            <View style={{ marginTop: 8 }} />
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
    marginTop: 24,
    width: 250,
    height: 200,
  },
  icon: {
    position: 'absolute',
    width: 90,
    height: 90,
  },
  mirror: {
    transform: [{ scaleX: -1 }, { rotate: '18deg' }],
  },
})

export default MyTurnGetReady
