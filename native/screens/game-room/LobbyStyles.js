import { StyleSheet } from 'react-native';
import * as Theme from '@theme';

export default StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
    // ${Theme.bp.xs} {
    //   margin-bottom: 2rem;
    // }
  },
  headerImg: {
    marginTop: 80,
    maxHeight: 140.7,
  },
  cap: {
    paddingBottom: 8,
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  // same as TeamsStyles
  headerTeam: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  // same as TeamsStyles
  team: {
    marginTop: 8,
    marginBottom: 40,
  },
});
