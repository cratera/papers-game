import { Platform, StyleSheet } from 'react-native'
import * as Theme from '@theme'

import { isTamagoshi, isWeb, window } from '@constants/layout'

const { vw } = window

const paperHeight = vw * 65

const slideHeight = isTamagoshi ? 50 * vw : 70 * vw

export default StyleSheet.create({
  header: {
    paddingVertical: isTamagoshi ? 8 : 16,
  },
  scrollKAV: {},
  slides: {
    height: slideHeight,
    maxHeight: paperHeight + 12,
    paddingHorizontal: 0,
  },
  slide: {
    ...(isWeb ? { height: slideHeight - 16 } : {}),
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bg,
    borderWidth: 2,
    borderColor: Theme.colors.grayMedium,
    paddingVertical: Platform === 'web' ? 16 : 0,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  slide_isActive: {
    borderColor: Theme.colors.grayDark,
  },
  input: {
    borderColor: 'transparent',
    color: Theme.colors.grayDark,
    textAlign: 'center',
    ...(isWeb ? { height: '100' /* 2 lines */ } : {}),
  },
  input_isActive: {
    // outline: none // not supported. TODO later, maybe an external stylesheet?...
  },
  status: {
    flexGrow: 1,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
  ctas_btn: {
    // backgroundColor: Theme.colors.primary,
  },
  ctas_btn_isHidden: {
    opacity: 0,
    // pointerEvents: 'none',
  },
})
