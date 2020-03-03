import React, { useContext, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import Button from '@components/button';
import SettingsModal from './SettingsModal';

export default function SettingsToggle(props) {
  const [isOpen, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    // TODO - Make modal support for web.
    return null;
  }

  return (
    <View>
      <SettingsModal isOpen={isOpen} onClose={() => setOpen(false)} />
      <Button variant="icon" accessibilityLabel="Settings Menu" onPress={() => setOpen(true)}>
        ⚙️
      </Button>
    </View>
  );
}
