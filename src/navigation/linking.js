import { createURL } from 'expo-linking'

export default {
  prefixes: [createURL('/')],
  config: {
    // Root: {
    //   path: 'root',
    screens: {
      home: 'home',
      'access-game': 'access-game',
      room: 'room',
      settings: 'settings',
    },
    //   },
  },
}
