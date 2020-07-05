import React from 'react'
import { Platform, TouchableOpacity, Text, View } from 'react-native'

import {
  setSoundStatus,
  getSoundStatus,
  setSoundInSilent,
  getSoundInSilent,
} from '@store/PapersSound.js' // meeeh this should be from Papers API
import PapersContext from '@store/PapersContext.js'
import Button from '@components/button'
import * as Theme from '@theme'

// TODO make this dynamic.
const sounds = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function AudioPreview() {
  const Papers = React.useContext(PapersContext)
  const [isOnSilent, setSoundSilent] = React.useState(getSoundInSilent)
  const [isSoundActive, setSound] = React.useState(getSoundStatus)

  function toggleMute() {
    setSoundInSilent(!isOnSilent)
    setSoundSilent(!isOnSilent)
  }

  function toggleSoundOn() {
    setSoundStatus(!isSoundActive)
    setSound(!isSoundActive)
  }

  async function startSound(soundId) {
    await Papers.playSound(soundId)
  }

  return (
    <View>
      <ItemToggle onPress={toggleSoundOn} isActive={isSoundActive} options={['On', 'Off']}>
        Sound
      </ItemToggle>
      {isSoundActive && Platform.OS === 'ios' ? (
        <ItemToggle onPress={toggleMute} isActive={isOnSilent} options={['Yes', 'No']}>
          Sound in silent
        </ItemToggle>
      ) : null}
      {isSoundActive && (
        <View>
          <Text style={[Theme.typography.h3, Theme.u.center, { marginVertical: 8 }]}>
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
      )}
    </View>
  )
}

function ItemToggle({ onPress, isActive, children, options }) /* eslint-disable-line */ {
  return (
    <TouchableOpacity
      variant="light"
      onPress={onPress}
      style={{
        borderWidth: 0,
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.grayLight,
        paddingHorizontal: 8,
        paddingVertical: 20,
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
        <Text style={Theme.typography.bold}>{children}</Text>
        <Text
          style={[
            Theme.typography.bold,
            { color: isActive ? Theme.colors.success : Theme.colors.grayMedium },
          ]}
        >
          {isActive ? options[0] : options[1]}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const Styles = {
  btn: {
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 20,
    marginBottom: 16,
  },
  btn_inner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}
