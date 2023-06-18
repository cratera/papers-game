import * as Theme from '@src/theme'
import { StyleSheet } from 'react-native'

import { window } from '@src/utils/device'

const { vw } = window

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
  step_isActive: {},
  media: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  illustration: {
    width: 60 * vw,
    height: 90 * vw,
    flexGrow: 1,
  },
  content: {
    marginTop: 24,
    minHeight: 150, // ~4 lines iphone 5
  },
  ctas: {},
  hightlight: {
    color: Theme.colors.pink,
  },
  web_left_margin: {
    width: 1,
  },
})
