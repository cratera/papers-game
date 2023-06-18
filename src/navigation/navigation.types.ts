export type AppStackParamList = {
  home: undefined
  'access-game': { variant: 'join' | 'create' }
  room: undefined | { screen: keyof GameRoomStackParamsList }
  settings: undefined
  tutorial: undefined | { isMandatory?: boolean; onDone?: EmptyCallback }
  gate: { goal: 'join' | 'rejoin' | 'leave' }
} & GameRoomStackParamsList &
  SettingsStackParamsList

type GameRoomStackParamsList = {
  playing: undefined
  'lobby-writing': undefined
  'lobby-joining': undefined
  'write-papers': undefined
  teams: undefined
}

type SettingsStackParamsList = {
  'settings-statistics': undefined
  'settings-accountDeletion': undefined
  'settings-sound': undefined
  'settings-purchases': undefined
  'settings-feedback': undefined
  'settings-privacy': undefined
  'settings-experimental': undefined
  'settings-credits': undefined
  'settings-profile': undefined
  'settings-profile-avatar': undefined
  'settings-players': undefined
  'settings-game': undefined
}
