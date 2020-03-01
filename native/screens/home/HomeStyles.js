import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

export default StyleSheet.create({
  main: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
  },
  paragraph: {
    marginVertical: 16,
    textAlign: 'center',
    // margin: 80 auto;
  },
  label: {
    textAlign: 'center',
    color: Theme.colors.grayMedium,
  },
  input: {
    borderBottomColor: Theme.colors.grayLight,
    borderBottomWidth: 1,
    textAlign: 'center',
    marginTop: 48,

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
    width: 256,
    height: 256,
    borderRadius: 140,
    backgroundColor: Theme.colors.primaryLight,
    marginVertical: 24,
    alignSelf: 'center',
  },
  avatarPlaceContent: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
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
    color: Theme.colors.primary,
  },

  feedback: {
    textAlign: 'center',
    color: Theme.colors.grayMedium,
  },

  // -----

  memeContainer: {
    position: 'relative',
    marginBottom: 48,

    // ${Theme.bp.xs} {
    //   margin-bottom: 1.4rem;
    // }
  },
  memeHead: {
    zIndex: 1,
  },
  memeFace: {
    backgroundColor: Theme.colors.grayDark,
    width: 70,
    height: 70,
    marginBottom: -60,
  },
  memeBody: {
    width: 200,
    height: 200,
    opacity: 0.8,
  },
});
