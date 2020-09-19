import { StyleSheet } from 'react-native'
// import * as Theme from '@theme'

export default StyleSheet.create({
  list: {
    marginTop: 0,
  },
  itemArea: {
    paddingVertical: 8,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingVertical: 12,
    // paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  item_isLast: {
    marginBottom: 0,
  },
  who: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
  },
  who_text: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
