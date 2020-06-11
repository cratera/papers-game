import React from 'react'
import { useNavigation } from '@react-navigation/native'
import PropTypes from 'prop-types'

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
      {/* BUG Weird. size does not work on Firefox, but inline style does. */}
      <IconGear size="20" style={{ width: 20, height: 20 }} />
    </Button>
  )
}

SettingsToggle.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}
