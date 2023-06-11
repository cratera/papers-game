import { StyleSheet, Text, View } from 'react-native'

import * as Theme from '@src/theme'

import ListPlayers from '@src/components/list-players'
import { CardScoreProps, PlayerItemScoreProps } from './CardScore.types'

export const podiumMap = {
  0: '1st place',
  1: '2nd place',
  2: '3rd place',
}

const PlayerItemScore = ({ ix, score }: PlayerItemScoreProps) => (
  <>
    {ix === 0 && (
      <Text
        style={[
          Theme.typography.badge,
          Theme.spacing.mr_16,
          { backgroundColor: Theme.colors.salmon },
        ]}
      >
        Best player
      </Text>
    )}

    <Text
      numberOfLines={1}
      style={[
        Theme.typography.body,
        Theme.spacing.ph_4,
        {
          backgroundColor: Theme.colors.grayDark,
          color: Theme.colors.bg,
        },
      ]}
    >
      {score}
    </Text>
  </>
)

const CardScore = ({
  index,
  isTie,
  teamName,
  scoreTotal,
  scoreRound,
  playersSorted,
  style,
  ...props
}: CardScoreProps) => (
  <View style={[Styles.fscore_item, style]} {...props}>
    <View style={Styles.fscore_summary}>
      <View style={Styles.fscore_info}>
        <Text style={Theme.typography.h3}>{teamName}</Text>
        <Text
          style={[
            Styles.fscore_tag,
            {
              backgroundColor: isTie || index === 0 ? Theme.colors.primary : Theme.colors.grayDark,
            },
            Theme.spacing.mb_8,
          ]}
        >
          {isTie ? 'Tie' : podiumMap[index]}
        </Text>
      </View>
      <View style={Styles.fscore_score}>
        <Text style={Theme.typography.h2}>{scoreTotal} pts</Text>
        <Text style={[Theme.typography.small, Theme.spacing.mt_4]}>+{scoreRound} this round</Text>
      </View>
    </View>
    <View style={Theme.spacing.mt_16}>
      <ListPlayers
        players={playersSorted.map(({ id }) => id)}
        RenderSuffix={({ ix }) => <PlayerItemScore ix={ix} score={playersSorted[ix].score} />}
      />
    </View>
  </View>
)

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
    fontSize: Theme.fontSize.small,
    color: Theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
})

export default CardScore
