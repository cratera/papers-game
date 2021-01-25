import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

import ListPlayers from '@components/list-players'

const podiumMap = {
  0: '1st place',
  1: '2nd place',
  3: '3rd place',
}

// eslint-disable-next-line react/prop-types
const PlayerItemScore = ({ ix, score }) => (
  <>
    {ix === 0 && (
      <Text
        style={[Theme.typography.badge, { marginRight: 16, backgroundColor: Theme.colors.salmon }]}
      >
        Best player
      </Text>
    )}

    <Text
      numberOfLines={1}
      style={[
        Theme.typography.body,
        {
          backgroundColor: Theme.colors.grayDark,
          color: Theme.colors.bg,
          paddingHorizontal: 4,
        },
      ]}
    >
      {score}
    </Text>
  </>
)

const CardScore = ({ index, isTie, teamName, scoreTotal, scoreRound, playersSorted }) => (
  <View style={Styles.fscore_item}>
    <View style={Styles.fscore_summary}>
      <View style={Styles.fscore_info}>
        <Text style={Theme.typography.h3}>{teamName}</Text>
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
      </View>
      <View style={Styles.fscore_score}>
        <Text style={[Theme.typography.h2]}>{scoreTotal} pts</Text>
        <Text style={[Theme.typography.small, { marginTop: 4 }]}>+{scoreRound} this round</Text>
      </View>
    </View>
    <View style={{ marginTop: 16 }}>
      <ListPlayers
        players={playersSorted.map(({ id }) => id)}
        RenderSuffix={({ ix }) => <PlayerItemScore ix={ix} score={playersSorted[ix].score} />}
      />
    </View>
  </View>
)

CardScore.propTypes = {
  index: PropTypes.number.isRequired,
  isTie: PropTypes.bool.isRequired,
  teamName: PropTypes.string.isRequired,
  scoreTotal: PropTypes.number.isRequired,
  scoreRound: PropTypes.number.isRequired,
  playersSorted: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      score: PropTypes.number,
    })
  ).isRequired,
}

const Styles = StyleSheet.create({
  fscore_item: {
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    borderRadius: 4,
    overflow: 'hidden',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  fscore_summary: {
    display: 'flex',
    flexDirection: 'row',
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
    fontSize: Theme.typography.fontSizeSmall,
    color: Theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
})

export default CardScore
