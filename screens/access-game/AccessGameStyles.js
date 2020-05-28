import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    marginTop: 40,
  },
  tip: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  input: {
    borderBottomColor: Theme.colors.grayLight,
    borderBottomWidth: 1,
    textAlign: 'center',
    marginTop: 32,
    color: Theme.colors.grayDark,
  },
  code: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  code_input: {
    color: Theme.colors.grayDark,
    textAlign: 'center',
    width: 26,
  },
  code_mask: {},
  hintMsg: {
    marginVertical: 8,
    textAlign: 'center',
  },
  errorMsg: {
    color: Theme.colors.danger,
  },
})
