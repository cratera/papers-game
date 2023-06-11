import React from 'react'
import { Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Button from '@src/components/button'
import Modal from '@src/components/modal'

import * as Theme from '@src/theme'
import { SheetProps } from './Sheet.types'

const Sheet = React.memo(function Sheet({ visible, list, onClose }: SheetProps) {
  const [isWeb] = React.useState(Platform.OS === 'web')
  React.useEffect(() => {
    if (isWeb && visible) {
      alert('TODO: Support sheet on web')
      onClose()
    }
  }, [isWeb, onClose, visible])

  if (isWeb) {
    return null
  }

  return (
    <Modal
      visible={visible}
      hiddenClose
      animationType="fade"
      transparent
      presentationStyle="overFullScreen"
      styleContent={Styles.modalContent}
    >
      <TouchableHighlight onPress={onClose}>
        <Text style={Styles.options_outside} accessible={false}></Text>
      </TouchableHighlight>

      <View style={Styles.options}>
        {list.map(({ text, onPress }, i) => (
          <Button
            key={i}
            style={Styles.options_btn}
            textColor={Theme.colors.grayDark}
            onPress={onPress}
            numberOfLines={1}
          >
            <View style={Styles.spacer} />
            <Text>{text}</Text>
          </Button>
        ))}
      </View>

      <Button style={Styles.cancel_btn} onPress={onClose}>
        Cancel
      </Button>
    </Modal>
  )
})

export default Sheet

const Styles = StyleSheet.create({
  options: {
    backgroundColor: Theme.colors.bg,
    paddingVertical: 8,
    paddingBottom: 12,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.grayDark,
  },
  options_outside: {
    flexGrow: 1,
  },
  options_btn: {
    backgroundColor: Theme.colors.bg,
    justifyContent: 'flex-start',
    borderWidth: 0,
    paddingVertical: 14,
  },
  modalContent: {
    backgroundColor: Theme.colors.grayMedium,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 41,
  },
  cancel_btn: {
    borderWidth: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  spacer: { width: 8, height: 1 }, // lazyness level 99
})
