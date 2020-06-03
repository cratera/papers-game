import React, { memo } from 'react'
import { View, Text, TouchableHighlight } from 'react-native'
import PropTypes from 'prop-types'

import * as Theme from '@theme'
import * as Styles from './ButtonStyles.js'

function Button({ variant, size, place, isLoading, children, style, styleTouch, ...otherProps }) {
  if (otherProps.hasBlock) {
    console.error('hasblock is deprecated!')
  }
  const Block = variant === 'icon' ? View : Text
  return (
    <TouchableHighlight
      {...otherProps}
      style={[Styles.touch, styleTouch]}
      underlayColor={Theme.colors.bg}
      {...(isLoading ? { disabled: true } : {})}
    >
      {/* BUG - When is a icon, the button doesn't work?? myturn go */}
      <Block style={[Styles.button({ variant, size, place }), style]}>
        <Text>{!isLoading ? children : '⏳'}</Text>
      </Block>
    </TouchableHighlight>
  )
}

Button.defaultProps = {
  variant: 'primary',
  size: 'default',
  place: null,
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'light', 'flat', 'icon']),
  size: PropTypes.oneOf(['default', 'sm']),
  place: PropTypes.oneOf(['edgeKeyboard']),
  isLoading: PropTypes.bool,
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
  styleTouch: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.number]),
}

export default memo(Button)
