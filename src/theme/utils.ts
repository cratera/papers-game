import { StyleSheet } from 'react-native'
import colors from './colors'

export default StyleSheet.create({
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
  ctaSafeArea: {
    height: 80,
  },
  text_primary: { color: colors.primary },
  text_success: { color: colors.success },
  text_danger: { color: colors.danger },
})
