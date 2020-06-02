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
      <Text nativeID="inputAvatar" style={[Theme.typography.body, Styles.label]}>
        Add your avatar
      </Text>
      <TouchableHighlight
        style={[Styles.avatarPlace, { marginVertical: 24 }]}
        underlayColor={Theme.colors.primary}
        onPress={() => setIsPickerVisible(true)}
      >
        {avatar ? (
          <Image
            style={[Styles.avatarPlace, Styles.avatarImg]}
            source={{ uri: avatar }}
            accessibilityLabel="Your uploaded avatar"
          />
        ) : (
          <View style={Styles.avatarPlaceContent}>
            { /* prettier-ignore */}
            <Svg style={Styles.avatarSvg} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Theme.colors.primary}>
              <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={Styles.avatarTxt}>Upload a picture</Text>
          </View>
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
