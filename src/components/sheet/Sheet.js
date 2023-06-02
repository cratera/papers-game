import PropTypes from 'prop-types'
import React from 'react'
import { Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Button from '@src/components/button'
import Modal from '@src/components/modal'

import * as Theme from '@src/theme'

const Sheet = React.memo(function Sheet({ visible, list, onClose }) {
  const [isWeb] = React.useState(Platform.OS === 'web')
  React.useEffect(() => {
    if (isWeb && visible) {
      alert('TODO: Support sheet on web')
      onClose()
    }
  }, [isWeb, visible])

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
      style={Styles.modal}
      styleContent={Styles.modalContent}
    >
      <TouchableHighlight onPress={onClose}>
        <Text style={Styles.options_outside} accessible={false}></Text>
      </TouchableHighlight>
      <View style={Styles.options}>
        {list.map(({ Icon, text, variant, onPress }, i) => (
          <Button
            key={i}
            style={Styles.options_btn}
            textColor={Theme.colors.grayDark}
            onPress={onPress}
            numberOfLines={1}
          >
            {Icon && (
              <Icon
                size={20}
                color={variant === 'danger' ? Theme.colors.danger : null}
                style={{ transform: [{ translateY: 4 }] }}
              />
            )}
            <View style={{ width: 8, height: 1 }}></View> {/* lazyness level 99 */}
            <Text style={{ color: variant === 'danger' ? Theme.colors.danger : undefined }}>
              {text}
            </Text>
          </Button>
        ))}
      </View>

      <Button
        style={{ borderWidth: 0, borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
        onPress={onClose}
      >
        Cancel
      </Button>
    </Modal>
  )
})

export default Sheet

Sheet.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.node.isRequired,
      onPress: PropTypes.func.isRequired,
    })
  ).isRequired,
}

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 41,
  },
})
