import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { BubblingCorner } from '@src/components/bubbling'
import Button from '@src/components/button'
import Page from '@src/components/page'
import Item from '@src/components/settings/Item'
import headerTheme from '@src/navigation/headerTheme'
import { usePapersContext } from '@src/store/PapersContext'
import { SoundName } from '@src/store/PapersSound.types'
import * as Theme from '@src/theme'

// OPTMIZE make this dynamic
const sounds: SoundName[] = ['ready', 'turnstart', 'wrong', 'right', 'bomb', 'fivesl', 'timesup']

export default function SoundAnimationsSettings() {
  const Papers = usePapersContext()
  const { profile } = Papers.state
  const settingsSoundActive = !!profile?.settings.sound // need !! in case is undefined
  const settingsMotion = !!profile?.settings.motion
  const [motionFeedback, setMotionFeedback] = useState(false)
  const router = useRouter()

  function toggleSoundOn() {
    Papers.soundToggleStatus()
    if (!settingsSoundActive) {
      startSound('ready')
    }
  }

  function toggleMotion() {
    setMotionFeedback(!settingsMotion)
    Papers.motionToggle()
  }

  async function startSound(soundId: SoundName) {
    await Papers.soundPlay(soundId)
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Sound & animations',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      {motionFeedback && (
        <BubblingCorner
          corner="settings" // very special case. I'll regret this
          duration={900}
          forced
          bgStart="bg"
          bgEnd="yellow"
        />
      )}

      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
          <View style={Theme.utils.cardEdge}>
            <Item title="Play sounds" switchValue={settingsSoundActive} onPress={toggleSoundOn} />

            <Item
              title="Reduce animations"
              description="Good for older phones or if the battery is low."
              switchValue={!settingsMotion}
              onPress={toggleMotion}
            />

            {settingsSoundActive && __DEV__ && (
              <View>
                <View style={Theme.utils.listDivider} />

                <Text style={[Theme.typography.h3, Theme.utils.center, Theme.spacing.mv_8]}>
                  Preview: (dev only)
                </Text>

                {sounds.map((soundId) => (
                  <Button
                    key={soundId}
                    variant="light"
                    size="sm"
                    onPress={() => startSound(soundId)}
                    style={[Theme.spacing.mv_4, Theme.spacing.mh_16]}
                  >
                    🔉 {soundId}
                  </Button>
                ))}
              </View>
            )}
          </View>

          <View style={Styles.button_wrapper} />
          {__DEV__ && (
            <Button onPress={Papers.resetProfileSettings}>Restore default settings</Button>
          )}
          <View style={Theme.utils.ctaSafeArea} />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

const Styles = StyleSheet.create({
  button_wrapper: {
    height: 40,
  },
})
