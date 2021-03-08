import { StyleSheet } from 'react-native'

import { isTamagoshi } from '@constants/layout'

export const colors = {
  grayDark: '#000000',
  grayMedium: 'rgba(0, 0, 0, 0.5)',
  grayLight: 'rgba(0, 0, 0, 0.2)',
  grayBg: '#F7F8FA',
  primary: '#FF8F50',
  primaryLight: '#FFE9DC',
  success: '#4EBD81',
  successLight: '#DCF2E6',
  danger: '#FF005c',
  bg: '#ffffff',

  orange: '#EFA16F',
  orange_desatured: '#EFBD9E',
  purple: '#C299C4',
  purple_desatured: '#C3A3C4',
  yellow: '#EED486',
  yellow_desatured: '#EEDA9D',
  pink: '#DE7C9B',
  pink_desatured: '#C56E8A',
  salmon: '#F2C9AD',
  salmon_desatured: '#F2D7C4',
  green: '#A3C764',
  green_desatured: '#B4CF84',
}

const fontSizeBase = isTamagoshi ? 16 : 18
const fontSizeSmall = isTamagoshi ? 13 : 14

export const typography = StyleSheet.create({
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
    fontSize: fontSizeBase,
    lineHeight: 22,
    color: colors.grayDark,
  },
  secondary: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeBase,
    lineHeight: 22,
    color: colors.grayMedium,
  },
  small: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeSmall,
    color: colors.grayMedium,
    letterSpacing: 0.1,
  },
  bold: {
    fontFamily: 'Karla-Regular',
    fontSize: fontSizeBase,
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    lineHeight: 14,
    paddingTop: 7,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
})

export const fontSize = {
  base: fontSizeBase,
  small: 15,
}

// Utils
export const u = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  // I'm gonna regret these helpers
  middle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEdge: {
    marginHorizontal: -16,
  },
  listDivider: {
    height: 8,
    borderBottomColor: colors.grayDark,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  scrollSideOffset: {
    // move scrollbar to the edge.
    paddingVertical: 8,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomColor: colors.grayDark,
    borderBottomWidth: 1,
  },
  CTASafeArea: {
    height: 80,
  },
  text_danger: { color: colors.danger },
  text_success: { color: colors.success },
  text_primary: { color: colors.primary },
})
