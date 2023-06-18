import { Modal, Platform, StyleSheet, View } from 'react-native'

import Button from '@src/components/button'
import { colors } from '@src/theme'
import { ModalWebProps, TheModalProps } from './Modal.types'

const ModalWeb = ({ children, visible, style, ...props }: ModalWebProps) => {
  if (!visible) {
    return null
  }
  return (
    <View
      style={[
        // eslint-disable-next-line react-native/no-inline-styles
        {
          position: 'fixed' as 'absolute', // View can't have fixed position
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: colors.bg,
          zIndex: 4, // TODO:(BUG Web) - header is above Modal.
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

export default function TheModal({
  children,
  visible = false,
  animationType = 'slide',
  transparent = false,
  presentationStyle = 'fullScreen',
  onClose,
  hiddenClose,
  styleContent,
  ...props
}: TheModalProps) {
  const Component = Platform.OS === 'web' ? ModalWeb : Modal

  return (
    <Component
      animationType={animationType}
      transparent={transparent}
      presentationStyle={presentationStyle}
      visible={visible}
      {...props}
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
