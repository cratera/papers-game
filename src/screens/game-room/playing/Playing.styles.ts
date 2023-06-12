import * as Theme from '@src/theme'
import { StyleSheet } from 'react-native'

import { isTamagoshi, window } from '@src/utils/device'
import { headerHeight } from '@src/utils/layout'

const { vw, vh } = window

export default StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 32,
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
  },
  go_count321: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 3 * vh,
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
    height: 65 * vw,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: Theme.colors.bg,
    marginTop: -100,
  },
  go_paper_changing: { flexGrow: 1 },
  go_paper_sentence: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  go_paper_word: {
    paddingHorizontal: 4,
    fontSize: 36, // review @mmbotelho - not part of DS
    lineHeight: 36, // enough to hide descenders (j, g, p, ...)
    marginVertical: 3,
  },
  go_paper_blur: {
    color: Theme.colors.grayDark,
    backgroundColor: Theme.colors.grayDark,
  },
  go_paper_key: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    opacity: 0.3,
  },
  go_paper_icon: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  go_paper_iconSvg: {
    width: 30,
    height: 30,
  },
  go_paper_gotcha: {
    backgroundColor: Theme.colors.successLight,
  },
  go_paper_word_gotcha: {
    // color: Theme.colors.success,
  },
  go_paper_word_nope: {
    // textDecorationLine: 'line-through',
    color: Theme.colors.grayMedium,
  },

  // Go cta...
  go_ctas: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  go_ctas_yes: {
    backgroundColor: Theme.colors.grayDark,
  },
  go_ctas_no: {
    backgroundColor: Theme.colors.grayDark,
  },

  // Turn StaTus:
  tst_flex: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10 * vh,
  },
  tst_flex_title: {
    marginBottom: isTamagoshi ? 16 : 40,
  },

  // Turn score:
  tscore_page: {
    paddingTop: 0, // so it scroll up to the very top.
  },
  tscore_header: {
    paddingTop: headerHeight,
  },
  tscore_list: {
    marginBottom: 120,
  },
  tscore_item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  tscore_start: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  tscore_iconArea: {
    width: 32,
    height: 32,
    borderColor: Theme.colors.grayDark,
    borderWidth: 2,
    borderRadius: 4,
    flexShrink: 0,
    marginRight: 16,
  },
  tscore_itemText: {
    flexShrink: 1,
  },
  tscore_title: {
    maxWidth: 300,
  },
  tscore_itemTextGuessed: {
    textDecorationLine: 'line-through',
  },
})
