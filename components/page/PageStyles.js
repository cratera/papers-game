import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

const gutter = 16

export default StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 500,
    // paddingHorizontal: calc((100vw - 500px) / 2)
    marginHorizontal: 'auto',
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: Theme.colors.bg,
  },
  main: {
    // paddingTop: headerH, // header is from Navigator
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    paddingHorizontal: gutter,
    alignSelf: 'stretch',
  },
  ctas: {
    backgroundColor: Theme.colors.bg,
    paddingHorizontal: gutter,
  },
})
