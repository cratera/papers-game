import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

const podiumMap = {
  0: '1st place',
  1: '2nd place',
  3: '3rd place',
}

const CardScore = ({ index, isTie, teamName, scoreTotal, scoreRound, bestPlayer }) => (
  <View style={Styles.fscore_item} key={index}>
    <View style={Styles.fscore_info}>
      <Text
        style={[
          Styles.fscore_tag,
          {
            backgroundColor: isTie || index === 0 ? Theme.colors.primary : Theme.colors.grayDark,
            marginBottom: 8,
          },
        ]}
      >
        {isTie ? 'Tie' : podiumMap[index]}
      </Text>
      <Text style={Theme.typography.h3}>{teamName}</Text>

      <Text style={[Theme.typography.small, { color: Theme.colors.grayDark, marginTop: 2 }]}>
        {bestPlayer.name} was the best player! ({bestPlayer.score})
      </Text>
    </View>
    <View style={Styles.fscore_score}>
      <Text style={Theme.typography.small}>Papers</Text>
      <Text style={Theme.typography.h1}>{scoreTotal}</Text>
      <Text style={Theme.typography.small}>+{scoreRound} this round</Text>
    </View>
  </View>
)

CardScore.propTypes = {
  index: PropTypes.number.isRequired,
  isTie: PropTypes.bool.isRequired,
  teamName: PropTypes.string.isRequired,
  scoreTotal: PropTypes.number.isRequired,
  scoreRound: PropTypes.number.isRequired,
  bestPlayer: PropTypes.shape({
    name: PropTypes.string,
    score: PropTypes.number,
  }).isRequired,
}

const Styles = StyleSheet.create({
  fscore_item: {
    backgroundColor: Theme.colors.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fscore_info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 1,
    marginRight: 8,
  },
  fscore_score: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fscore_tag: {
    fontSize: 14,
    color: Theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 9,
    overflow: 'hidden',
  },
})

export default CardScore
