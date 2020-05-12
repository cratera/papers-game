import { StyleSheet } from 'react-native'

export const colors = {
  grayDark: '#484F5D',
  grayMedium: '#7F848E',
  grayLight: '#E5E6E8',
  primary: '#FF8F50',
  primaryLight: '#FFE9DC',
  success: '#4EBD81',
  successLight: '#DCF2E6',
  danger: '#FF005c',
  bg: '#ffffff',
}

export const typography = StyleSheet.create({
  h1: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 48,
    color: colors.grayDark,
  },
  h2: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  body: {
    fontSize: 16,
    color: colors.grayDark,
  },
  secondary: {
    fontSize: 16,
    color: colors.grayMedium,
  },
  small: {
    fontSize: 14,
    color: colors.grayMedium,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  italic: {
    color: colors.grayMedium,
    fontStyle: 'italic',
  },
})

// Utils
export const u = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  scrollSideOffset: {
    // move scrollbar to the edge.
    marginRight: -16,
    paddingRight: 16,
  },
  text_danger: { color: colors.danger },
  text_success: { color: colors.success },
  text_primary: { color: colors.primary },
})
