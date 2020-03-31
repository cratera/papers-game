import React, { memo } from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

import * as Theme from '@theme';
import * as Styles from './ButtonStyles.js';

function Button({ variant, size, place, isLoading, children, style, styleTouch, ...otherProps }) {
  if (otherProps.hasBlock) {
    console.error('hasblock is deprecated!');
  }
  return (
    <TouchableHighlight
      {...otherProps}
      style={[Styles.touch, styleTouch]}
      underlayColor={Theme.colors.bg}
    >
      <Text style={[Styles.button({ variant, size, place }), style]}>
        <Text>{children}</Text>
        {isLoading ? <Text style={Styles.loading}> ⏳</Text> : ''}
      </Text>
    </TouchableHighlight>
  );
}

Button.defaultProps = {
  variant: 'primary', // primary | success | light | flat | icon
  size: 'default',
  place: null, // edgeKeyboard,
};

export default memo(Button);
