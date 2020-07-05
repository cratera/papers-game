import { Audio } from 'expo-av'
import Sentry from '@constants/Sentry'

const SOUNDS = {
  default: {
    bomb: 'https://freesound.org/data/previews/17/17216_59895-lq.mp3',
    fivesl:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2F5_seconds_left.mp3?alt=media&token=9d0588b7-0fe8-4e9c-a1ee-f196607baff5',
    ready:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2FReady.mp3?alt=media&token=1852bd66-346d-416c-a146-455c30b71fc9',
    right:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2FRight_answer.mp3?alt=media&token=c416ffc2-df68-40b5-9047-d8baf036585d',
    timesup:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2FTime_s_up.mp3?alt=media&token=aa9cbcd1-79c8-4c2d-839a-9c0183dc5f5a',
    turnstart:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2FTurn_start.mp3?alt=media&token=180958f4-2799-4472-9364-be8b7ef4d2f6',
    wrong:
      'https://firebasestorage.googleapis.com/v0/b/papers-game.appspot.com/o/game%2FWrong_answer.mp3?alt=media&token=35146689-f9ad-4e61-9c27-48ff55cfae48',
  },
}
const playset = {}

let isSoundActive = true
let isSoundInSilent = true

export async function init() {
  Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    // shouldDuckAndroid: true,
    // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    // playThroughEarpieceAndroid: false
  })

  await loadAudioSkin()
}

async function loadAudioSkin() {
  try {
    for (const soundId in SOUNDS.default) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS.default[soundId] },
        { shouldPlay: false }
      )
      playset[soundId] = sound
    }
    console.log('🔊 Loaded success')
    return true
  } catch (e) {
    console.warn('🔊 Loaded failed', e)
  }
  return false
}

export function setSoundStatus(bool) {
  isSoundActive = bool
}

export function getSoundStatus() {
  return isSoundActive
}

export function setSoundInSilent(bool) {
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: bool,
  })
  isSoundInSilent = bool
}

export function getSoundInSilent() {
  return isSoundInSilent
}

export function play(soundId) {
  if (!isSoundActive) {
    // console.warn(`🔊 play: sound is off.`)
    return
  }
  if (playset[soundId]) {
    try {
      playset[soundId].replayAsync()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PSND_0' } })
      console.warn('🔊 play: failed', e.message)
    }
  } else {
    Sentry.captureMessage(`Sound "${soundId}" does not exist.`)
    console.warn(`🔊 Sound: "${soundId}" does not exist.`)
  }
}
