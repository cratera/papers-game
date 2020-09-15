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
  // logo: {
  //   // TODO / REVIEW This is how we do @media. Abstract this.
  //   marginTop: vh > 6 ? vh * 20 : vh * 5,
  //   fontSize: 100,
  // },
  paragraph: {
    marginVertical: 16,
    textAlign: 'center',
    // margin: 80 auto;
  },
  input: {
    borderBottomColor: Theme.colors.grayDark,
    borderBottomWidth: 2,
    textAlign: 'center',
    marginTop: 4,
    height: 76,

    // ${Theme.bp.xs} {
    //   margin-top: 1.6rem;
    //   margin-bottom: 1.6rem;
    // }
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
  avatarSvg: {
    /* camera */
    marginTop: -16,
    marginBottom: 16,
  },
  avatarImg: {
    // ${avatarPlace}
    resizeMode: 'cover',
  },
  avatarTxt: {
    fontSize: 16,
    color: Theme.colors.grayDark,
  },

  feedback: {
    textAlign: 'center',
    color: Theme.colors.grayMedium,
  },

  // -----

  memeContainer: {
    position: 'relative',
    marginBottom: 32,

    // ${Theme.bp.xs} {
    //   margin-bottom: 1.4rem;
    // }
  },
  memeHead: {
    zIndex: 1,
    height: 70,
  },
  memeFace: {
    backgroundColor: Theme.colors.grayDark,
    width: 70,
    height: 70,
  },
  memeBody: {
    width: 200,
    height: 200,
    opacity: 0.8,
    marginTop: -60,
  },
})
