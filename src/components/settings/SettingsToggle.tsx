import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StyleSheet, Text, TouchableHighlight, TouchableHighlightProps, View } from 'react-native'

import { IconGear } from '@src/components/icons'

import { AppStackParamList } from '@src/navigation/navigation.types'
import * as Theme from '@src/theme'

export default function SettingsToggle({
  style,
  ...props
}: Omit<TouchableHighlightProps, 'underlayColor' | 'onPress'>) {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>()

  return (
    <TouchableHighlight
      underlayColor={Theme.colors.grayLight}
      onPress={() => navigation.navigate('settings')}
      style={[Styles.button, Theme.spacing.pv_8, style]}
      {...props}
    >
      <View style={Theme.utils.middle}>
        <Text style={Theme.typography.body}>Menu</Text>
        <IconGear size={16} style={Theme.spacing.ml_16} color={Theme.colors.grayDark} />
      </View>
    </TouchableHighlight>
  )
}

const Styles = StyleSheet.create({
  button: {
    borderRadius: 4,
  },
})
