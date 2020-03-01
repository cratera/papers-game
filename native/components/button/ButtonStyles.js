import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

const variants = {
  primary: {
    bg: Theme.colors.primary,
    text: Theme.colors.bg,
  },
  success: {
    bg: Theme.colors.success,
    text: Theme.colors.bg,
  },
  danger: {
    bg: Theme.colors.danger,
    text: Theme.colors.bg,
  },
  light: {
    bg: Theme.colors.bg,
    text: Theme.colors.primary,
  },
  flat: {
    bg: Theme.colors.bg,
    text: Theme.colors.grayDark, // primary just on skip. @mmbotelho
  },
  icon: {
    bg: 'transparent',
    color: Theme.colors.grayDark,
  },
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden', // so borderRadius works.
    fontSize: 14,
    lineHeight: 14,
    flexShrink: 0,
    textAlign: 'center',
    // boxShadow: variants[variant].boxShadow,
  },

  // ------- variants
  icon: {
    width: 44,
    height: 44,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  flat: {
    borderRadius: 0,
    height: 'auto',
    alignSelf: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // ${variant === 'success' ? '' : 'box-shadow: 0px 4px 16px rgba(204, 127, 81, 0.3);'}

  // --------- sizes
  sm: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: 14,
  },
});

export const button = ({ variant, size }) => {
  return [
    styles.base,
    styles[variant],
    styles[size],
    {
      backgroundColor: variants[variant].bg,
      color: variants[variant].text,
    },
  ];
};
