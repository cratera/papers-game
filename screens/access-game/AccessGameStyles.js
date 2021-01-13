import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: 40,
  },
  tip: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
  },
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 4,
    color: Theme.colors.grayDark,
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
    // fontFamily: 'youngSerif-regular',
    // fontVariantNumeric: 'tabular-nums',
  },
  code_maskPlaceholder: {
    color: Theme.colors.grayMedium,
    textAlign: 'center',
    width: 30,
  },
  hintMsg: {
    marginVertical: 16,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.yellow,
    color: Theme.colors.grayDark,
  },
})
