import React, { memo } from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

import * as Styles from './ButtonStyles.js';

function Button({ as, variant, hasBlock, size, children, style, ...restProps }) {
  // const Tag = as || 'TouchableHighlight';
  return (
    <TouchableHighlight {...restProps}>
      <Text style={[Styles.button({ variant, size }), style]}>{children}</Text>
    </TouchableHighlight>
  );
}

Button.defaultProps = {
  variant: 'primary', // primary | success | light | flat | icon
  size: 'default',
};

export default memo(Button);
