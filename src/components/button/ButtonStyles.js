import * as Theme from '@src/theme'
import { isTamagoshi } from '@src/utils/device'
import { StyleSheet } from 'react-native'

const variants = {
  primary: {
    bg: Theme.colors.grayDark,
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
  blank: {
    bg: Theme.colors.bg,
    text: Theme.colors.grayDark,
  },
  disabled: {
    bg: 'rgba(0, 0, 0, 0.3)', // Theme.colors.grayLight,
    text: Theme.colors.bg,
  },
  light: {
    bg: 'transparent',
    text: Theme.colors.grayDark,
  },
  ghost: {
    bg: 'transparent',
    text: Theme.colors.grayDark,
  },
  flat: {
    bg: 'transparent',
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
    minHeight: isTamagoshi ? 54 : 66,
    // maxWidth: 800,
    borderRadius: 12,
    paddingHorizontal: 16,
    overflow: 'hidden', // so borderRadius works.
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ------- variants

  primary: {
    borderWidth: 2,
    borderColor: Theme.colors.grayDark,
  },
  disabled: {
    borderWidth: 2,
    borderColor: Theme.colors.transparent,
  },
  icon: {
    width: 44,
    height: 44,
    minHeight: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
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
    borderWidth: 2,
    borderColor: Theme.colors.grayDark,
  },

  // --------- sizes
  sm: {
    minHeight: 34,
    paddingHorizontal: 12,
  },

  lg: {
    minWidth: 65,
    minHeight: 65,
  },

  // --------- place
  edgeKeyboard: {
    marginBottom: 16,
  },

  place_float: {
    shadowColor: Theme.colors.grayDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 1,
  },
})

const stylesSize = {
  default: 18,
  sm: 14,
  lg: 18,
}

// TODO: Later - This code is 💩...
export const btnWrapper = ({ variant, size, place, bgColor, disabled }) => {
  const variantToApply = disabled ? 'disabled' : variant
  return [
    styles.base,
    {
      backgroundColor: bgColor || variants[variantToApply].bg,
    },
    styles[variantToApply],
    styles[size],
    styles[place],
  ]
}

export const btnText = ({ variant, size, color }) => {
  return {
    fontFamily: ['flat', 'ghost'].includes(variant) ? 'Karla-Regular' : 'YoungSerif-Regular',
    fontSize: variant === 'flat' ? 16 : stylesSize[size],
    color: color || variants[variant].text,
  }
}

export const touch = styles.touch

export const place_float = styles.place_float // eslint-disable-line
