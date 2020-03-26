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
  item_isLast: {
    marginBottom: 0,
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
  itemStatus_writting: {
    paddingLeft: 75 - 56,
  },
  itemStatus_done: {
    width: 75,
  },
});
