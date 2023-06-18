import * as Theme from '@src/theme'
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: 40,
  },
  tip: {
    marginTop: 16,
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // TODO: component TextField
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 4,
    color: Theme.colors.pink,
    height: 76,
  },
  code: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  code_input: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    width: '100%',
    textAlign: 'center',
    marginTop: 32,
  },
  code_maskDigit: {
    textAlign: 'center',
    width: 30,
    fontFamily: 'YoungSerif-Regular',
    // fontVariantNumeric: 'tabular-nums',
  },
  code_maskPlaceholder: {
    color: Theme.colors.grayMedium,
    textAlign: 'center',
    width: 30,
  },
  hintMsg_wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hintMsg: {
    marginVertical: 16,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: Theme.fontSize.small,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.yellow,
    color: Theme.colors.grayDark,
  },
})
