import React, { memo } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import * as Theme from '@theme';

export default function Avatar({ src, alt, hasMargin, size = 'md', ...otherProps }) {
  const Tag = src ? Image : View;

  return (
    <Tag
      {...(src
        ? {
            source: { uri: src },
            accessibilityLabel: '',
          }
        : {})}
      style={[
        Styles.avatar,
        src && { resizeMode: 'cover' },
        hasMargin && Styles.margin,
        Styles[`size_${size}`],
      ]}
      {...otherProps}
    />
  );
}

const Styles = StyleSheet.create({
  avatar: {
    backgroundColor: Theme.colors.primaryLight,
  },
  margin: {
    marginRight: 16,
  },
  size_md: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  size_lg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
