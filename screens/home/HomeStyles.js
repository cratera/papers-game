import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

import { window } from '@constants/layout'

const { vw } = window

export default StyleSheet.create({
  main: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 40,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    marginVertical: 16,
    textAlign: 'center',
  },
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 4,
    height: 76,
  },
  avatarList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  avatarItem: {
    width: vw * 29,
    height: vw * 29,
    marginVertical: vw * 2,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  avatarItem_active: {
    borderColor: Theme.colors.grayDark,
  },
  cta: {
    marginBottom: 16,
  },
  ctaBottom: {
    marginBottom: 56,
    textAlign: 'center',
  },
  feedback: {
    textAlign: 'center',
    color: Theme.colors.grayMedium,
  },

  // -----

  CTAtutorial: {
    marginTop: 16,
    height: 56,
  },
  CTAtutorial_text: {
    color: Theme.colors.bg,
  },
})
