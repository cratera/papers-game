import { StyleSheet } from 'react-native'
// import * as Theme from '@theme'

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
    width: 45,
    height: 45,
    marginLeft: 8,
  },
  itemStatus_writting: {
    paddingLeft: 60 - 45,
    marginLeft: 8 + (60 - 45),
  },
  itemStatus_done: {
    width: 60,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
})
