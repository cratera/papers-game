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
      style={[{ paddingTop: 8 }, style]}
      {...props}
    >
      <IconGear style={{ width: 20, height: 20 }} />
    </Button>
  )
}

SettingsToggle.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}
