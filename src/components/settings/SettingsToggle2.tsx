import { StyleSheet, Text, TouchableHighlight, TouchableHighlightProps, View } from 'react-native'

import { IconGear } from '@src/components/icons'

import * as Theme from '@src/theme'
import { useRouter } from 'expo-router'

export default function SettingsToggle({
  style,
  ...props
}: Omit<TouchableHighlightProps, 'underlayColor' | 'onPress'>) {
  const router = useRouter()

  return (
    <TouchableHighlight
      underlayColor={Theme.colors.grayLight}
      onPress={() => router.push('/settings')}
      style={[Styles.button, Theme.spacing.p_8, style]}
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
