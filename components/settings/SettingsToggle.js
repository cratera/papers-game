import React from 'react'
import { useNavigation } from '@react-navigation/native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'

import Button from '@components/button'
import { IconGear } from '@components/icons'

export default function SettingsToggle({ style, ...props }) {
  const navigation = useNavigation()

  return (
    <Button
      variant="icon"
      accessibilityLabel="Settings page"
      onPress={() => navigation.navigate('settings')}
      style={[{ borderWidth: 0 }, style]}
      {...props}
    >
      <IconGear size={20} color={Theme.colors.grayDark} />
    </Button>
  )
}

SettingsToggle.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}
