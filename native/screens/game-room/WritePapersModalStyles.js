import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

export default StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  header_icon: {
    width: 24,
    height: 24,
    marginRight: 8,
    flexShrink: 0,
  },
  header_txt: {
    paddingRight: 60,
  },
  slides: {
    marginTop: 8,
    paddingTop: 8,
    paddingBottom: 32,
  },
  slide: {
    marginVertical: 8,
  },
  input: {
    borderColor: Theme.colors.grayLight,
    borderRadius: 3,
    borderWidth: 1,
    paddingLeft: 8,
    height: 44,
    color: Theme.colors.grayDark,
  },
  input_isActive: {
    borderColor: Theme.colors.primary,
  },
  ctas: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});
