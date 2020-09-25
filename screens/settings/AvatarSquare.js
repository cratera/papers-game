import React from 'react'
import { Image, StyleSheet, TouchableHighlight, View } from 'react-native'
import PropTypes from 'prop-types'

import { PickAvatar } from '@components/profile'

import * as Theme from '@theme'

// import { IconCamera } from '@components/icons'

export default function AvatarSquare({ avatar, size, stroke, style, onChange }) {
  const [isPickerVisible, setIsPickerVisible] = React.useState(false)
  const stylesSize = { width: size, height: size }
  const Wrapper = onChange ? TouchableHighlight : View
  return (
    <View style={[StylesAv.avatar, style]}>
      <Wrapper
        underlayColor={Theme.colors.bg}
        style={StylesAv.square}
        onPress={() => setIsPickerVisible(true)}
      >
        {avatar ? (
          <Image
            style={[StylesAv.place, StylesAv.img, stylesSize, { borderWidth: stroke }]}
            source={{ uri: avatar }}
            accessibilityLabel=""
          />
        ) : (
          <View style={[StylesAv.place, stylesSize]} />
        )}
      </Wrapper>
      {onChange && (
        <PickAvatar
          visible={isPickerVisible}
          onChange={() => null}
          onSubmit={onChange}
          onClose={() => setIsPickerVisible(false)}
        />
      )}
    </View>
  )
}

AvatarSquare.defaultProps = {
  size: 88,
  stroke: 1,
}

AvatarSquare.propTypes = {
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
  place: {
    borderColor: Theme.colors.grayDark,
    backgroundColor: Theme.colors.primaryLight,
  },
  // icon: {
  //   position: 'absolute',
  //   bottom: -8,
  //   right: -8,
  //   backgroundColor: Theme.colors.primary,
  //   width: 20,
  //   height: 20,
  //   borderRadius: 4,
  //   paddingTop: 3,
  //   paddingLeft: 3,
  //   overflow: 'hidden',
  // },
  img: {
    resizeMode: 'cover',
  },
})
