import React from 'react'
import Button from '@components/button'
import { useNavigation } from '@react-navigation/native'

export default function SettingsToggle(props) {
  const navigation = useNavigation()

  return (
    <Button
      variant="icon"
      accessibilityLabel="Settings page"
      onPress={() => navigation.navigate('settings')}
      {...props}
    >
      ⚙️
    </Button>
  )
}
