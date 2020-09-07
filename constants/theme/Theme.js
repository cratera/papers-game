import { StyleSheet } from 'react-native'

export const colors = {
  grayDark: '#000000',
  grayMedium: 'rgba(0, 0, 0, 0.5)',
  grayLight: '#E5E6E8',
  grayBg: '#F7F8FA',
  primary: '#FF8F50',
  primaryLight: '#FFE9DC',
  success: '#4EBD81',
  successLight: '#DCF2E6',
  danger: '#FF005c',
  bg: '#ffffff',

  green: '#A3C764',
  pink: '#DE7C9B',
  purple: '#C299C4',
  yellow: '#EED486',
  // ....
}

export const typography = StyleSheet.create({
  h1: {
    fontFamily: 'youngSerif-regular',
    fontSize: 44,
    lineHeight: 44,
    color: colors.grayDark,
  },
  h2: {
    fontFamily: 'youngSerif-regular',
    fontSize: 28,
    color: colors.grayDark,
  },
  h3: {
    fontFamily: 'youngSerif-regular',
    fontSize: 24,
    color: colors.grayDark,
  },
  display: {
    fontFamily: 'karla-regular',
    fontSize: 24,
    color: colors.grayDark,
  },
  body: {
    fontFamily: 'karla-regular',
    fontSize: 16,
    color: colors.grayDark,
  },
  secondary: {
    fontFamily: 'karla-regular',
    fontSize: 16,
    color: colors.grayMedium,
  },
  small: {
    fontFamily: 'karla-regular',
    fontSize: 13, // TODO - 14 is too big compared to figma. @mmbotelho
    color: colors.grayMedium,
    letterSpacing: -0.3,
  },
  bold: {
    fontFamily: 'karla-regular',
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  // italic: {
  //   fontFamily: 'karla-regular',
  //   color: colors.grayMedium,
  //   fontStyle: 'italic',
  // },
  error: {
    fontFamily: 'karla-regular',
    fontSize: 14,
    color: colors.danger,
  },
})

// Utils
export const u = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  cardEdge: {
    marginHorizontal: -16,
  },
  scrollSideOffset: {
    // move scrollbar to the edge.
    // marginLeft: -16,
    // paddingLeft: 16, // REVIEW this later
    marginRight: -16,
    paddingHorizontal: 16,
    marginLeft: -16,
  },
  CTASafeArea: {
    height: 80,
  },
  text_danger: { color: colors.danger },
  text_success: { color: colors.success },
  text_primary: { color: colors.primary },
})
