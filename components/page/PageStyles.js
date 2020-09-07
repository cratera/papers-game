import { StyleSheet } from 'react-native'

import { hasNotch, isWeb } from '@constants/layout'

import * as Theme from '@theme'

const edgeGutter = 16

export default StyleSheet.create({
  page: {
    width: '100%',
    flex: 1,
    alignItems: 'stretch',
  },
  pageInner: {
    width: '100%',
    paddingTop: isWeb ? 75 : hasNotch ? 35 : 45, // safe area
    maxWidth: 500,
    marginHorizontal: 'auto',
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    alignSelf: 'stretch',
  },
  main: {
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    paddingHorizontal: edgeGutter,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: edgeGutter,
  },
})
