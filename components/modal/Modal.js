import React from 'react'
import PropTypes from 'prop-types'

// import * as Theme from '@theme'
import { Platform, StyleSheet, Modal, View } from 'react-native'

import Button from '@components/button'

const ModalWeb = ({ children, visible, ...otherProps }) => {
  if (!visible) {
    return null
  }
  return (
    <View
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        zIndex: 4, // TODO/BUG Web - header is above Modal.
      }}
      {...otherProps}
    >
      {children}
    </View>
  )
}

ModalWeb.propTypes = {
  children: PropTypes.node,
  visible: PropTypes.bool,
}

export default function TheModal({
  children,
  visible,
  onClose,
  hiddenClose,
  styleContent,
  ...otherProps
}) {
  const Component = Platform.OS === 'web' ? ModalWeb : Modal

  return (
    <Component
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      visible={visible}
      {...otherProps}
    >
      {!hiddenClose && (
        <View style={Styles.close}>
          <Button variant="icon" accessibilityLabel="Close Modal" onPress={onClose}>
            ❌
          </Button>
        </View>
      )}
      <View style={[Styles.content, styleContent]}>{children}</View>
    </Component>
  )
}

TheModal.propTypes = {
  children: PropTypes.node,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  hiddenClose: PropTypes.bool,
  styleContent: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
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
    zIndex: 2,
  },
})
