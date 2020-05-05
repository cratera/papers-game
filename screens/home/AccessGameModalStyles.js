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
    marginBottom: 16,
  },
  input: {
    borderBottomColor: Theme.colors.grayLight,
    borderBottomWidth: 1,
    textAlign: 'center',
    marginTop: 48,
    color: Theme.colors.grayDark,
  },
  errorMsg: {
    color: Theme.colors.danger,
    marginVertical: 8,
    textAlign: 'center',
  },
})
