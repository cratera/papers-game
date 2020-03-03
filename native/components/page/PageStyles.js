import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

const statusBarH = 24;
const gutter = 16;
const fadeH = 40;
const headerH = statusBarH + 64;

export default StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: 'auto',
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: Theme.colors.bg,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: headerH,
    backgroundColor: Theme.colors.bg,
    paddingTop: statusBarH,
    paddingBottom: 8,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  main: {
    paddingTop: headerH,
    flexGrow: 1,
    paddingHorizontal: gutter,
    alignSelf: 'stretch',
  },
  ctas: {
    paddingHorizontal: gutter,
  },

  // export const ctas = ({ hasChildren }) => css`
  //   position: relative;
  //   display: flex;
  //   flex-direction: column;
  //   align-items: stretch;
  //   grid-area: ctas;
  //   align-self: end;
  //   padding: 0 ${gutter} 5.6rem;

  //   ${Theme.bp.xs} {
  //     padding: 0 ${gutter} 3.2rem;
  //   }

  //   &:empty {
  //     padding: 0;
  //   }

  //   /* fadeout effect */
  //   box-shadow: 0 -${fadeH} 3rem white;

  //   &::before {
  //     content: '';
  //     display: block;
  //     height: 1px;
  //     width: calc(100% + (${gutter} * 2));
  //     margin-left: -${gutter};
  //     margin-top: -${fadeH};
  //   }

  //   & > button:not(:last-child),
  //   & > a:not(:last-child) {
  //     margin-bottom: 1.6rem;
  //   }
  // `;
});
