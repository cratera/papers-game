import { StyleSheet } from 'react-native'
// import * as Theme from '@theme'

export default StyleSheet.create({
  header: {
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  header_title: {
    // display: 'flex',
    // justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },

  // Header in Writting
  headerW: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 24,
    // ${Theme.bp.xs} {
    //   margin-bottom: 2rem;
    // }
  },
  header_img: {
    marginTop: 8,
    width: 140,
    height: 140,
  },
  header_img_done: {
    width: 196,
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  list: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  // same as TeamsStyles
  team: {
    marginTop: 8,
    marginBottom: 40,
  },
  status: {
    paddingTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
