import React, { Fragment } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import Button from '@components/button'
import Page from '@components/page'

import * as Theme from '@theme'

import { IconNonWords } from '@components/icons'

import Styles from '../PlayingStyles.js'

console.log('hum', IconNonWords)

const MyTurnGetReady = ({ description, isOdd, onStartClick, nr }) => {
  const place = (x, y, deg) => ({
    left: x,
    top: y,
    transform: [{ rotate: deg }],
  })
  const opacity = {
    opacity: 0.3,
  }

  const mirror = {
    transform: [{ scaleX: -1 }, { rotate: '18deg' }],
  }

  return (
    <Fragment>
      <Page.Main>
        <View style={Styles.header}>
          <Text style={Theme.typography.h2}>Round {nr}</Text>
          <View style={StylesIn.illustration}>
            <IconNonWords style={[StylesIn.icon, opacity, place(25, 0, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, opacity, place(120, 0, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, opacity, place(0, 90, '30deg')]} />
            <IconNonWords style={[StylesIn.icon, opacity, place(150, 70, '-15deg')]} />

            <IconNonWords style={[StylesIn.icon, place(105, 25, '0deg')]} />
            <IconNonWords style={[StylesIn.icon, place(30, 50, '18deg'), mirror]} />
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
  isOdd: PropTypes.bool,
  onStartClick: PropTypes.func.isRequired,
  nr: PropTypes.number.isRequired,
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
})

export default MyTurnGetReady
