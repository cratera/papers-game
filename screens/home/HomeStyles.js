import { StyleSheet } from 'react-native'
import * as Theme from '@theme'

// const vh = Dimensions.get('window').height / 100

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
  cta: {
    marginBottom: 16,
  },
  ctaBottom: {
    marginBottom: 56,
    textAlign: 'center',
  },
  avatarPlace: {
    width: 160,
    height: 160,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    alignSelf: 'center',
  },
  avatarImg: {
    resizeMode: 'cover',
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
