import { LinkingOptions } from '@react-navigation/native'
import { createURL } from 'expo-linking'

export default {
  prefixes: [createURL('/')],
  config: {
    screens: {
      home: 'home',
      'access-game': 'access-game',
      room: 'room',
      settings: 'settings',
    },
  },
} satisfies LinkingOptions<Record<'home' | 'access-game' | 'room' | 'settings', string>>
