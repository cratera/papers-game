import React from 'react'
import PropTypes from 'prop-types'
import { Platform } from 'react-native'

import Sheet from '@components/sheet'
import usePickAvatar from './usePickAvatar.js'

export default function PickAvatar({ visible, onSubmit, onClose, onChange }) {
  const pickAvatar = usePickAvatar()
  const [isWeb] = React.useState(Platform.OS === 'web')

  React.useEffect(() => {
    if (isWeb && visible) {
      handleUpdateAvatar({ camera: false })
      // Force close so the user can choose a pic again if they cancel.
      onClose()
    }
  }, [isWeb, visible])

  if (isWeb) {
    return null
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      list={[
        {
          text: '📷 Camera',
          onPress: () => handleUpdateAvatar({ camera: true }),
        },
        {
          text: '🖼 Library',
          onPress: handleUpdateAvatar,
        },
      ]}
    />
  )

  async function handleUpdateAvatar(opts = {}) {
    if (isWeb) {
      const url = await pickAvatar(opts)
      onSubmit(url)
      return
    }

    onChange('loading')
    const url = await pickAvatar(opts)
    if (url) {
      onSubmit(url)
      onChange('loaded')
      onClose()
    } else {
      onChange('')
    }
  }
}

PickAvatar.propTypes = {
  visible: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired, // url: String
  onClose: PropTypes.func.isRequired, // url: String
  onChange: PropTypes.func.isRequired, // (status: 'loaded' | '')
}
