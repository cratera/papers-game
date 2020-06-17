import React, { Fragment } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import PapersContext from '@store/PapersContext.js'

import Button from '@components/button'
import Page from '@components/page'
import { IconNonWords } from '@components/icons'
import TurnStatus from './TurnStatus'

import * as Theme from '@theme'

import Styles from './PlayingStyles.js'

const place = (x, y, deg) => ({
  left: x,
  top: y,
  transform: [{ rotate: deg }],
})

const MyTurnGetReady = ({ description, roundIx, amIWaiting }) => {
  const Papers = React.useContext(PapersContext)
  const { game, profile } = Papers.state
  const round = game.round
  const roundNr = round.current + 1

  function onStartClick() {
    Papers.startTurn()
  }

  return (
    <Fragment>
      <Page.Main blankBg>
        <View style={Styles.header}>
          <Text style={Theme.typography.h2}>Round {roundNr}</Text>
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
          <Text style={Theme.typography.secondary}>Rules:</Text>
          <Text style={[Theme.typography.bold, Theme.u.center, { marginTop: 8 }]}>
            {description}
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs blankBg>
        <TurnStatus
          style={{ marginBottom: 16 }}
          title="Next up"
          player={{ ...profile, name: 'You!' }}
          teamName={
            !game.hasStarted || amIWaiting
              ? 'Waiting for everyone to say they are ready.'
              : 'Everyone is ready!'
          }
        />
        {game.hasStarted && !amIWaiting && <Button onPress={onStartClick}>Start turn</Button>}
      </Page.CTAs>
    </Fragment>
  )
}

MyTurnGetReady.propTypes = {
  description: PropTypes.string.isRequired,
  roundIx: PropTypes.number,
  amIWaiting: PropTypes.bool,
}

const StylesIn = StyleSheet.create({
  illustration: {
    marginTop: 16,
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
