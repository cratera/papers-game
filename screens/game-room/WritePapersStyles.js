import { Dimensions, StyleSheet } from 'react-native'
import * as Theme from '@theme'

const vw = Dimensions.get('window').width / 100
const vh = Dimensions.get('window').height / 100

export default StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingTop: 16,
  },
  scrollKAV: {
    flexGrow: 1,
    flexShrink: 1, // secret to make it scroll
  },
  slides: {
    // display: 'flex',
    // flexDirection: 'row',
    marginLeft: -16,
    marginTop: 16,
    maxHeight: vh * 20 + 8,
  },
  slide: {
    height: vh * 20,
    width: vw * 100 - 32,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderColor: Theme.colors.grayLight,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  slide_isActive: {
    borderColor: Theme.colors.primary,
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
    pointerEvents: 'none',
  },
})
