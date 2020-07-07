import { Dimensions, StyleSheet } from 'react-native'
import * as Theme from '@theme'

const vw = Dimensions.get('window').width / 100
const vh = Dimensions.get('window').height / 100

export default StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // go view (counting...)
  go_countMain: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  go_count321: {
    color: Theme.colors.primary,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  go_counting: {
    color: Theme.colors.grayDark,
    textAlign: 'center',
    marginTop: 40,
  },
  go_done_msg: {
    textAlign: 'center',
    marginTop: 25 * vh,
  },
  go_zone: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  go_paper: {
    height: 60 * vw,
    backgroundColor: Theme.colors.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: Theme.colors.grayDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 40,
  },
  go_paper_sentence: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  go_paper_word: {
    paddingHorizontal: 4,
    lineHeight: 34, // enough to hide descenders (j, g, p, ...)
    marginVertical: 3,
  },
  go_paper_blur: {
    color: Theme.colors.grayLight,
    backgroundColor: Theme.colors.grayLight,
  },
  go_paper_key: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    opacity: 0.3,
  },
  go_paper_icon: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  go_paper_iconSvg: {
    width: 24,
    height: 24,
  },
  go_paper_gotcha: {
    backgroundColor: Theme.colors.successLight,
  },
  go_paper_word_gotcha: {
    color: Theme.colors.success,
  },
  go_paper_word_nope: {
    textDecorationLine: 'line-through',
    color: Theme.colors.grayMedium,
  },

  // Go cta...
  go_ctas: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  go_ctas_yes: {
    borderWidth: 0,
    backgroundColor: Theme.colors.success,
  },
  go_ctas_no: {
    borderWidth: 0,
    backgroundColor: Theme.colors.danger,
  },

  // Turn StaTus:
  tst_flex: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tst_team: {
    marginTop: 8,
  },

  // Turn score:
  tscore_list: {
    marginBottom: 60,
    marginRight: -16,
  },
  tscore_item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Theme.colors.bg,
  },
})
