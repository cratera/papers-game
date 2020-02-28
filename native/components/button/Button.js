import React, { memo } from 'react';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';

import * as Styles from './ButtonStyles.js';

function Button({ as, variant, hasBlock, size, children, ...restProps }) {
  // const Tag = as || 'TouchableHighlight';
  return (
    <TouchableHighlight {...restProps}>
      <Text style={Styles.button({ variant, size })}>{children}</Text>
    </TouchableHighlight>
  );
}

Button.defaultProps = {
  variant: 'primary', // primary | success | light | flat | icon
  size: 'default',
};

export default memo(Button);
