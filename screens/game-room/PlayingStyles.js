import { Dimensions, StyleSheet } from 'react-native';
import * as Theme from '@theme';

const vw = Dimensions.get('window').width / 100;
const vh = Dimensions.get('window').height / 100;

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
  go_count321: {
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },

  go_paper: {
    height: 60 * vw,
    backgroundColor: Theme.colors.grayLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  go_paper_word: {
    textAlign: 'center',
  },
  go_paper_blur: {
    opacity: 0.8,
  },
  // go_paper_tipBlur: {},
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
  },
  go_cta_dim: {
    opacity: 0.5,
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
    marginBottom: 40,
  },
  tscore_item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.grayLight,
    marginVertical: 4,
  },
  tscore_btnRemove: {
    color: Theme.colors.danger,
  },
  tscore_btnRemove: {
    color: Theme.colors.danger,
  },

  // Final score:
  fscore_list: {
    marginBottom: 16,
  },
  fscore_item: {
    backgroundColor: Theme.colors.grayLight,
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fscore_score: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fscore_tag: {
    fontSize: 14,
    color: Theme.colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
