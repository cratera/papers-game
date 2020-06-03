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
    text: Theme.colors.grayDark,
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
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 24,
    overflow: 'hidden', // so borderRadius works.
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ------- variants

  primary: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  icon: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: Theme.colors.grayLight,
  },
  flat: {
    borderRadius: 0,
    height: 'auto',
    minHeight: 'auto',
    alignSelf: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  light: {
    borderWidth: 1,
    borderColor: Theme.colors.grayMedium,
  },

  // --------- sizes
  sm: {
    minHeight: 34,
    borderRadius: 17,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },

  // --------- place
  edgeKeyboard: {
    marginBottom: 16,
  },
})

const stylesSize = {
  default: 16,
  sm: 14,
}

// TODO Later - This code is 💩...
export const btnWrapper = ({ variant, size, place, bgColor }) => {
  return [
    styles.base,
    {
      backgroundColor: bgColor || variants[variant].bg,
    },
    styles[variant],
    styles[size],
    styles[place],
  ]
}

export const btnText = ({ variant, size, color }) => {
  return {
    fontSize: stylesSize[size],
    color: color || variants[variant].text,
  }
}

export const touch = styles.touch
