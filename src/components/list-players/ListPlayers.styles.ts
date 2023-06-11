import { StyleSheet } from 'react-native'

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
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  item_isLast: {
    marginBottom: 0,
  },
  who: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  who_text: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loading: {
    width: 40,
    height: 40,
    marginRight: 16,
    paddingTop: 12,
    paddingLeft: 4,
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
