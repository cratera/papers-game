import React from 'react'
import { Platform, TouchableOpacity, Text, View } from 'react-native'
import { Audio } from 'expo-av'

import PapersContext from '@store/PapersContext.js'
import Button from '@components/button'
import * as Theme from '@theme'

// TODO make this dynamic.
const sounds = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function AudioPreview() {
  const Papers = React.useContext(PapersContext)
  const [onMute, setOnMute] = React.useState(true) // meh.... todo this

  function toggleMute() {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: !onMute,
    })

    setOnMute(!onMute)
  }

  async function startSound(soundId) {
    await Papers.playSound(soundId)
  }

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <TouchableOpacity
          variant="light"
          onPress={toggleMute}
          style={{
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
            borderBottomColor: Theme.colors.grayLight,
            paddingHorizontal: 8,
            paddingVertical: 20,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={Theme.typography.bold}>Play sounds on mute:</Text>
            <Text
              style={[
                Theme.typography.bold,
                { color: onMute ? Theme.colors.success : Theme.colors.grayMedium },
              ]}
            >
              {onMute ? 'Yes' : 'No'}
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}
      <Text style={[Theme.typography.h3, Theme.u.center, { marginBottom: 8 }]}>
        Sounds preview:
      </Text>
      {sounds.map(soundId => (
        <Button
          key={soundId}
          variant="light"
          size="sm"
          onPress={() => startSound(soundId)}
          style={{ margin: 4 }}
        >
          🔉 {soundId}
        </Button>
      ))}
    </View>
  )
}
