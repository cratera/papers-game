import { Dimensions, StyleSheet } from 'react-native'
import * as Theme from '@theme'

const vw = Dimensions.get('window').width / 100
// const vh = Dimensions.get('window').height / 100

const paperHeight = vw * 70

export default StyleSheet.create({
  header: {
    paddingVertical: 16,
  },
  scrollKAV: {},
  slides: {
    // display: 'flex',
    // flexDirection: 'row',
    marginLeft: -16,
    maxHeight: paperHeight + 12,
  },
  slide: {
    width: vw * 100 - 32,
    marginHorizontal: 16,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: Theme.colors.grayDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  slide_isActive: {
    shadowOpacity: 0.5,
  },
  input: {
    borderColor: 'transparent',
    color: Theme.colors.grayDark,
    textAlign: 'center',
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
    paddingTop: 4,
    paddingBottom: 8,
  },
  ctas_btn: {
    backgroundColor: Theme.colors.primary,
  },
  ctas_btn_isHidden: {
    opacity: 0,
    // pointerEvents: 'none',
  },
})
