import React from 'react';
import { Platform, Text, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';

import Modal from '@components/modal';
import Button from '@components/button';

import * as Theme from '@theme';

import usePickAvatar from './utils/usePickAvatar.js';

export default function PickAvatar({ visible, onSubmit, onClose, onChange }) {
  const pickAvatar = usePickAvatar();
  const [isWeb] = React.useState(Platform.OS === 'web');

  React.useEffect(() => {
    if (isWeb && visible) {
      handleUpdateAvatar({ camera: false });
      // Force close so the user can choose a pic again if cancelled before.
      onClose();
    }
  }, [isWeb, visible]);

  if (isWeb) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      hiddenClose
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      style={Styles2.modal}
      styleContent={Styles2.modalContent}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Text style={Styles2.options_outside} accessible={false}></Text>
      </TouchableWithoutFeedback>
      <View style={Styles2.options}>
        <Button
          style={[Styles2.options_btn, Styles2.options_btnTop]}
          onPress={() => handleUpdateAvatar({ camera: true })}
        >
          📷Camera
        </Button>
        <Button style={[Styles2.options_btn, Styles2.options_btnBot]} onPress={handleUpdateAvatar}>
          🖼 Library
        </Button>
      </View>

      <Button onPress={onClose}>Close</Button>
    </Modal>
  );

  async function handleUpdateAvatar(opts = {}) {
    if (isWeb) {
      const url = await pickAvatar(opts);
      onSubmit(url);
      return;
    }

    onChange('loading');
    const url = await pickAvatar(opts);
    if (url) {
      onSubmit(url);
      onChange('loaded');
      onClose();
    } else {
      onChange('');
    }
  }
}

const Styles2 = StyleSheet.create({
  options: {
    backgroundColor: Theme.colors.bg,
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  options_outside: {
    flexGrow: 1,
    // backgroundColor: Theme.colors.primary,
  },
  options_btn: {
    backgroundColor: Theme.colors.bg,
    color: Theme.colors.grayDark,
    textAlign: 'left',
  },
  options_btnTop: {
    // 🐛 Not working on IOS...
    // borderBottomEndRadius: 0,
    // borderBottomStartRadius: 0,
  },
  options_btnBot: {
    // 🐛 Not working on IOS...
    // borderTopLeftRadius: 0,
    // borderTopRightRadius: 0,
  },
  modal: {},
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 56,
  },
});
