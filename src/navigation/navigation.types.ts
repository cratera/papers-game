export type AppStackParamList = {
  home: undefined
  'access-game': { variant: 'join' | 'create' }
  room: undefined | { screen: keyof GameRoomStackParamsList }
  playing: undefined
  teams: undefined
  settings: undefined
  tutorial: undefined | { isMandatory?: boolean; onDone?: EmptyCallback }
  gate: { goal: 'leave' }
}

export type GameRoomStackParamsList = {
  playing: undefined
  'lobby-writing': undefined
  'lobby-joining': undefined
  'write-papers': undefined
}

export type SettingsStackParamsList = {
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
}
