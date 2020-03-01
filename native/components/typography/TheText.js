import React from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Theme from '@theme';

// HUM..... Not sure if I like this.
const TheText = ({ style, children, ...otherProps }) => (
  <Text
    style={[{ color: Theme.colors.grayDark, fontSize: 16, lineHeight: 18 }, style]}
    {...otherProps}
  >
    {children}
  </Text>
);

export default TheText;
