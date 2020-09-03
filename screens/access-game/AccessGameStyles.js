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
    width: 25,
    fontFamily: 'karla-regular',
    // fontVariantNumeric: 'tabular-nums',
  },
  code_maskPlaceholder: {
    color: Theme.colors.grayMedium,
    textAlign: 'center',
    width: 25,
  },
  hintMsg: {
    marginVertical: 8,
    textAlign: 'center',
  },
  errorMsg: {
    color: Theme.colors.danger,
  },
})
