import { Text, View } from 'react-native'

import Avatar from '@src/components/avatar'

import * as Theme from '@src/theme'
import Styles from './Playing.styles.js'
import { TurnStatusProps } from './Playing.types.js'

const TurnStatus = ({ title, player, teamName, style }: TurnStatusProps) => (
  <View style={[Styles.tst_flex, style]}>
    <Text style={[Theme.typography.secondary, Styles.tst_flex_title]}>{title}</Text>
    <Avatar size="xl" src={player.avatar} />
    <Text
      style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mt_24, Theme.spacing.mb_8]}
    >
      {title || player.name}
    </Text>
    <Text style={[Theme.typography.secondary, Theme.utils.center]}>{teamName}</Text>
  </View>
)

export default TurnStatus
