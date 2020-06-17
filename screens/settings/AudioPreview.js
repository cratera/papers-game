import React from 'react'
import { View, Text } from 'react-native'
import { Audio } from 'expo-av'

import * as Theme from '@theme'

import Button from '@components/button'

const sounds = {
  default: {
    startCount: 'https://freesound.org/data/previews/474/474474_7903707-lq.mp3',
    endCount: 'https://freesound.org/data/previews/434/434888_4042910-lq.mp3',
  },
}
export default function AudioPreview() {
  const [audioSkin, setAudioSkin] = React.useState('default')
  const [isLoading, setIsLoading] = React.useState(true)
  const playset = React.useRef()

  React.useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      // shouldDuckAndroid: true,
      // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      // playThroughEarpieceAndroid: false
    })
  }, [])

  React.useEffect(() => {
    async function loadAudioSkin() {
      const { sound: startCount, status: s1 } = await Audio.Sound.createAsync(
        { uri: sounds.default.startCount },
        { shouldPlay: false }
      )
      const { sound: endCount, status: s2 } = await Audio.Sound.createAsync(
        { uri: sounds.default.endCount },
        { shouldPlay: false }
      )

      playset.current = {
        startCount,
        endCount,
      }
      setIsLoading(false)
    }
    loadAudioSkin()
  }, [audioSkin])

  async function startSound(name) {
    console.log('on the way....', name)

    await playset.current[name].replayAsync()
  }

  return (
    <View>
      <Button variant="light" onPress={() => startSound('startCount')}>
        {isLoading ? 'Loading sound...' : 'Start turn 🔉'}
      </Button>
      <Button variant="light" onPress={() => startSound('endCount')}>
        {isLoading ? 'Loading sound...' : 'Finish turn 🔉'}
      </Button>
    </View>
  )
}
