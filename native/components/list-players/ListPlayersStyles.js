import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

export default StyleSheet.create({
  list: {
    marginTop: 16,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginBottom: 16 /* 2.4 too big */,
    justifyContent: 'space-between',
  },
  who: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStatus: {
    width: 56,
    height: 56,
  },
});
