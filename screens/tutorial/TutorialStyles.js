import { Platform, StyleSheet } from 'react-native'
import * as Theme from '@theme'

import { window } from '@constants/layout'

const { vw, vh } = window

export default StyleSheet.create({
  slides: {
    paddingHorizontal: 0,
  },
  step: {
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    marginBottom: 100,
  },
  slide_isActive: {},
  media: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexGrow: 1,
  },
  illustration: {
    width: 60 * vw,
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
