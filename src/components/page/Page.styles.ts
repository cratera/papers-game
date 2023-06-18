import { StyleSheet } from 'react-native'

import { headerHeight } from '@src/utils/layout'

import * as Theme from '@src/theme'

const edgeGutter = 16

export default StyleSheet.create({
  page: {
    width: '100%',
    flex: 1,
    alignItems: 'stretch',
  },
  pageInner: {
    width: '100%',
    paddingTop: headerHeight,
    maxWidth: 500,
    marginHorizontal: 'auto',
    flexGrow: 1,
    flexShrink: 1 /* so it scrolls */,
    alignSelf: 'stretch',
  },
  main: {
    flexGrow: 1,
    flexShrink: 1,
    alignSelf: 'stretch',
    paddingHorizontal: edgeGutter,
  },
  banner: {
    backgroundColor: Theme.colors.grayDark,
    paddingVertical: 8,
    top: headerHeight,
    zIndex: 1,
  },
  banner_text: {
    color: Theme.colors.bg,
    textAlign: 'center',
    fontSize: Theme.fontSize.small,
  },
  ctas: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: edgeGutter,
  },
  chevron_left: {
    transform: [{ rotate: '180deg' }, { translateY: -6 }, { translateX: 7 }],
    marginRight: -4,
  },
  left_close: { width: 16, height: 24 },
  chevron_right: { transform: [{ translateY: 6 }, { translateX: -4 }], marginRight: -4 },

  spacer: { width: 8, height: 1 },
  offset: { marginTop: -22 },
})
