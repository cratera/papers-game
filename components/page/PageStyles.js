import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

const gutter = 16

export default StyleSheet.create({
  page: {
    width: '100%',
    flex: 1,
    alignItems: 'stretch',
  },
  pageInner: {
    width: '100%',
    paddingTop: 70, // header height
    maxWidth: 500,
    marginHorizontal: 'auto',
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    alignSelf: 'stretch',
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
