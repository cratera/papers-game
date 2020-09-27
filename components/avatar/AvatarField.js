import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'

import { PickAvatar } from '@components/avatar'
import Avatar from './Avatar.js'

// import * as Theme from '@theme'

export default function AvatarField({ avatar, style, onChange }) {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false)
  return (
    <View style={[StylesAv.avatar, style]}>
      <TouchableOpacity onPress={() => setIsPickerVisible(true)}>
        <Avatar src={avatar} size="xxl" alt="Profile picture" />
      </TouchableOpacity>
      <PickAvatar
        visible={isPickerVisible}
        onChange={() => null}
        onSubmit={onChange}
        onClose={() => setIsPickerVisible(false)}
      />
    </View>
  )
}

AvatarField.defaultProps = {
  size: 88,
  stroke: 1,
}

AvatarField.propTypes = {
  avatar: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  onChange: PropTypes.func,
  size: PropTypes.number,
  stroke: PropTypes.number,
}

const StylesAv = StyleSheet.create({
  avatar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
  },
})
