import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

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
}

const styles = StyleSheet.create({
  touch: {
    flexShrink: 0,
  },
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 44,
    borderRadius: 22,
    overflow: 'hidden', // so borderRadius works.
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',

    // BUG IOS: Shadow doesn't work on safari 🤦‍♀️
    // shadowColor: Theme.colors.primary,
    // shadowRadius: 2,
    // shadowOffset: { width: 4, height: 2 },
    // shadowOpacity: 0.7,
  },

  // ------- variants
  icon: {
    width: 44,
    height: 44,
    fontSize: 16,
    lineHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  flat: {
    borderRadius: 0,
    height: 'auto',
    minHeight: 'auto',
    lineHeight: 44,
    alignSelf: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  light: {
    // REVIEW DESIGN with @mmbotelho
    borderWidth: 2,
    lineHeight: 14, // make up the border
    borderColor: Theme.colors.primary,
  },

  // ${variant === 'success' ? '' : 'box-shadow: 0px 4px 16px rgba(204, 127, 81, 0.3);'}

  // --------- sizes
  sm: {
    minHeight: 34,
    borderRadius: 17,
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: 14,
    lineHeight: 20,
  },

  // --------- place
  edgeKeyboard: {
    marginBottom: 16,
  },
})

export const button = ({ variant, size, place }) => {
  return [
    styles.base,
    {
      backgroundColor: variants[variant].bg,
      color: variants[variant].text,
    },
    styles[variant],
    styles[size],
    styles[place],
  ]
}

export const loading = {
  // TODO
}

export const touch = styles.touch
