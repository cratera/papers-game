import React from 'react'
import PropTypes from 'prop-types'
import { Platform, Text, View, TouchableHighlight, StyleSheet } from 'react-native'

import Modal from '@components/modal'
import Button from '@components/button'

import * as Theme from '@theme'

export default function PickAvatar({ visible, list, onClose }) {
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
        {list.map(({ text, onPress }, i) => (
          <Button key={i} style={[Styles.options_btn]} onPress={onPress}>
            {text}
          </Button>
        ))}
      </View>

      <Button onPress={onClose}>Close</Button>
    </Modal>
  )
}

PickAvatar.propTypes = {
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
    marginBottom: 16, // Review these spacing across all views.
    paddingVertical: 8,
    borderRadius: 16,
  },
  options_outside: {
    flexGrow: 1,
  },
  options_btn: {
    backgroundColor: Theme.colors.bg,
    color: Theme.colors.grayDark,
    textAlign: 'left',
    borderWidth: 0,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 41,
  },
})
