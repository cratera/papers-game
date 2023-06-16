import * as Theme from '@src/theme'
import { Platform, StyleSheet } from 'react-native'

import { isTamagoshi, isWeb, window } from '@src/utils/device'

const { vw } = window

const paperHeight = vw * 65

const slideHeight = isTamagoshi ? 50 * vw : 70 * vw

export default StyleSheet.create({
  header: {
    paddingVertical: isTamagoshi ? 8 : 16,
  },
  scrollKAV: {
    opacity: 1,
  },
  slides: {
    height: slideHeight,
    maxHeight: paperHeight + 12,
    paddingHorizontal: 0,
  },
  slidePlaceholder: {
    height: slideHeight,
    backgroundColor: Theme.colors.bg,
    borderRadius: 12,
    padding: 15 * vw,
    marginBottom: 32,
  },
  slideTitle: {
    marginBottom: 16,
  },
  slide: {
    ...(isWeb ? { height: slideHeight - 16 } : {}),
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bg,
    // borderWidth: 2,
    // borderColor: Theme.colors.grayMedium,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 0,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  slide_isActive: {
    borderColor: Theme.colors.grayDark,
  },
  input: {
    borderColor: Theme.colors.transparent,
    color: Theme.colors.grayDark,
    textAlign: 'center',
    ...(isWeb ? { height: '100' /* 2 lines */, fontSize: 28 } : {}),
    ...(isTamagoshi ? { fontSize: 28 } : { fontSize: 36 }),
  },
  input_isActive: {
    // outline: none // not supported. TODO: later, maybe an external stylesheet?...
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
    borderWidth: 0,
  },
  ctas_btn_isHidden: {
    opacity: 0,
    // pointerEvents: 'none',
  },
  web_left_margin: {
    width: 1,
  },
})
