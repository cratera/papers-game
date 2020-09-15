import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { Image, TouchableHighlight, Text, View } from 'react-native'
import { Svg, Path } from 'react-native-svg'

import { PickAvatar } from '@components/profile'

import * as Theme from '@theme'
import Styles from './HomeStyles.js'

export default function InputAvatar({ avatar, onChange }) {
  const [status, setStatus] = React.useState(null) // loading || loaded || error?
  const [isPickerVisible, setIsPickerVisible] = React.useState(false)

  return (
    <Fragment>
      <Text nativeID="inputAvatar" style={[Theme.typography.secondary, Theme.u.center]}>
        Add your avatar
      </Text>
      <TouchableHighlight
        style={[Styles.avatarPlace, { marginVertical: 24 }]}
        underlayColor={Theme.colors.purple}
        onPress={() => setIsPickerVisible(true)}
      >
        {avatar ? (
          <Image
            style={[Styles.avatarPlace, Styles.avatarImg]}
            source={{ uri: avatar }}
            accessibilityLabel="Your uploaded avatar"
          />
        ) : (
          <View />
        )}
      </TouchableHighlight>
      <Text style={[Theme.typography.body, Styles.feedback]}>
        {status === 'loading' ? 'Loading...' : ''}
        {status === 'loaded' ? 'Looking good!' : ''}
      </Text>

      <PickAvatar
        visible={isPickerVisible}
        onSubmit={onChange}
        onClose={() => setIsPickerVisible(false)}
        onChange={setStatus}
      />
    </Fragment>
  )
}

InputAvatar.propTypes = {
  avatar: PropTypes.string,
  onChange: PropTypes.func.isRequired, // (value: String)
}
