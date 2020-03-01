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
  avatarPlace: {
    width: 256,
    height: 256,
    borderRadius: 140,
    backgroundColor: Theme.colors.primaryLight,
    marginVertical: 24,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',

    // svg {
    //   /* camera */
    //   stroke: ${Theme.colors.primary};
    //   display: inline-block;
    //   margin-bottom: 1.6rem;
    // }
  },
  avatarImg: {
    // ${avatarPlace}
    resizeMode: 'cover',
  },
  avatarTxt: {
    color: Theme.colors.primary,
  },

  // -----

  // memeContainer: {
  //   position: 'relative';
  //   marginBottom: 48,

  //   // ${Theme.bp.xs} {
  //   //   margin-bottom: 1.4rem;
  //   // }
  // }

  // memeFace: css`
  //   ${avatarImg}
  //   background: ${Theme.colors.grayDark};
  //   margin: -0.6rem 0;
  //   width: 7rem;
  //   height: 7rem;
  //   position: absolute;
  //   top: 0;
  //   left: 50%;
  //   transform: translateX(-50%);
  //   z-index: 1;
  // `;

  // memeBody: css`
  //   width: 20rem;
  //   height: 20rem;
  //   opacity: 0.8;
  // `;
});
