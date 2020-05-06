import React, { Fragment } from 'react'
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

const MyTurnGetReady = ({ description }) => {
  const Papers = React.useContext(PapersContext)
  const { game } = Papers.state
  const round = game.round
  const roundNr = round.current + 1

  function onStartClick() {
    Papers.startTurn()
  }

  return (
    <Fragment>
      <Page.Main>
        <View style={Styles.header}>
          <Text style={Theme.typography.h2}>Round {roundNr}</Text>
          <View style={StylesIn.illustration}>
            <IconNonWords style={[StylesIn.icon, StylesIn.faded, place(25, 0, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, StylesIn.faded, place(120, 0, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, StylesIn.faded, place(0, 90, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, StylesIn.faded, place(150, 70, '-15deg')]} />

            <IconNonWords style={[StylesIn.icon, place(105, 25, '0deg')]} />
            <IconNonWords style={[StylesIn.icon, place(30, 50, '18deg'), StylesIn.mirror]} />
            <IconNonWords style={[StylesIn.icon, place(87, 87, '18deg')]} />
          </View>
          <Text style={Theme.typography.secondary}>Rules:</Text>
          <Text style={[Theme.typography.bold, Theme.u.center, { marginTop: 8 }]}>
            {description}
          </Text>
        </View>
      </Page.Main>
      <Page.CTAs>
        <Text>[TODO Next player]</Text>
        <Button onPress={onStartClick}>Start your turn</Button>
      </Page.CTAs>
    </Fragment>
  )
}

MyTurnGetReady.propTypes = {
  description: PropTypes.string.isRequired,
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
  faded: {
    opacity: 0.3,
  },
  mirror: {
    transform: [{ scaleX: -1 }, { rotate: '18deg' }],
  },
})

export default MyTurnGetReady
