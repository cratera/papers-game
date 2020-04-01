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
  scrollKAV: {
    flexGrow: 1,
    flexShrink: 1, // secret to make it scroll
  },
  slides: {
    marginTop: 16,
    paddingBottom: 40,
  },
  slide: {
    marginBottom: 16,
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
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 8,
  },
});
