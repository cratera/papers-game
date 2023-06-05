export interface SoundSkin {
  bomb: string
  fivesl: string
  ready: string
  right: string
  timesup: string
  turnstart: string
  wrong: string
}

export interface SoundLibrary {
  default: SoundSkin
}

export type SoundSkinName = keyof SoundLibrary
export type SoundName = keyof SoundSkin
