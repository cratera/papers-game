import { isTamagoshi } from '@src/utils/device'
import { StyleSheet } from 'react-native'
import colors from './colors'
import fontSize from './fontSize'

const fontSizeSmall = isTamagoshi ? 13 : 14

export default StyleSheet.create({
  h1: {
    fontFamily: 'YoungSerif-Regular',
    fontSize: 44,
    lineHeight: 44,
    color: colors.grayDark,
  },
  h2: {
    fontFamily: 'YoungSerif-Regular',
    fontSize: 28,
    color: colors.grayDark,
  },
  h3: {
    fontFamily: 'YoungSerif-Regular',
    fontSize: 24,
    color: colors.grayDark,
  },
  h4: {
    fontFamily: 'YoungSerif-Regular',
    fontSize: 16,
    color: colors.grayDark,
  },
  display: {
    fontFamily: 'Karla-Regular',
    fontSize: 24,
    color: colors.grayDark,
  },
  body: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSize.base,
    lineHeight: 22,
    color: colors.grayDark,
  },
  secondary: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSize.base,
    lineHeight: 22,
    color: colors.grayMedium,
  },
  inverted: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSize.base,
    lineHeight: 22,
    color: colors.bg,
  },
  small: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeSmall,
    color: colors.grayMedium,
    letterSpacing: 0.1,
  },
  bold: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSize.base,
    lineHeight: 22,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  error: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeSmall,
    color: colors.danger,
  },
  badge: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeSmall,
    backgroundColor: colors.grayVeryLight,
    lineHeight: 14,
    paddingTop: 7,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
})
