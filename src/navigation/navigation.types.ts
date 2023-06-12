export type AppStackParamList = {
  home: undefined
  'access-game': { variant: 'join' | 'create' }
  room: undefined
  settings: undefined
  tutorial: { isMandatory: boolean; onDone: EmptyCallback }
  gate: { goal: 'leave' }
}
