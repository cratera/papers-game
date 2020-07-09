import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

const gutter = 16

export default StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: 'auto',
    flex: 1,
    alignItems: 'stretch',
  },
  main: {
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    paddingHorizontal: gutter,
    alignSelf: 'stretch',
  },
  banner: {
    backgroundColor: Theme.colors.grayDark,
    paddingVertical: 8,
  },
  banner_text: {
    color: Theme.colors.bg,
    textAlign: 'center',
    fontSize: 14,
  },
  ctas: {
    paddingHorizontal: gutter,
  },
})
