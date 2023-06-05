import { useNavigation } from '@react-navigation/native'
import PropTypes from 'prop-types'
import { Text, TouchableHighlight, View } from 'react-native'

import { IconGear } from '@src/components/icons'

import * as Theme from '@src/theme'

export default function SettingsToggle({ style, ...props }) {
  const navigation = useNavigation()

  return (
    <TouchableHighlight
      underlayColor={Theme.colors.grayLight}
      onPress={() => navigation.navigate('settings')}
      style={[{ paddingVertical: 8, paddingHorizontal: 8, borderRadius: 4 }, style]}
      {...props}
    >
      <View style={Theme.utils.middle}>
        <Text style={Theme.typography.body}>Menu</Text>
        <IconGear size={16} style={{ marginLeft: 16 }} color={Theme.colors.grayDark} />
      </View>
    </TouchableHighlight>
  )
}

SettingsToggle.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}
