import React from 'react';

import * as Theme from '@theme';
import { StyleSheet, Modal, View } from 'react-native';

import Button from '@components/button';

export default function TheModal({ children, onClose, ...otherProps }) {
  return (
    <Modal animationType="slide" transparent={false} presentationStyle="fullScreen" {...otherProps}>
      <View style={Styles.close}>
        <Button variant="icon" onPress={onClose}>
          [X]
        </Button>
      </View>
      <View style={Styles.content}>{children}</View>
    </Modal>
  );
}

const Styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  close: {
    position: 'absolute',
    top: 32,
    right: 8,
    zIndex: 21,
  },
});
